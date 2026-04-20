import fs from 'fs/promises';
import path from 'path';
import { getKafkaAdmin, getKafkaBrokers, getKafkaTopic, isKafkaEnabled } from '../config/kafka.js';

const outputRoot = process.env.SPARK_ANALYTICS_OUTPUT_DIR
  ? path.resolve(process.env.SPARK_ANALYTICS_OUTPUT_DIR)
  : path.resolve(process.cwd(), '../analytics/output');

const readJsonFiles = async (dirPath, limit = 200) => {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const jsonFiles = entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
      .map((entry) => path.join(dirPath, entry.name))
      .sort((a, b) => b.localeCompare(a))
      .slice(0, limit);

    const rows = await Promise.all(
      jsonFiles.map(async (filePath) => {
        const content = await fs.readFile(filePath, 'utf8');
        const lines = content
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean);
        return lines.map((line) => JSON.parse(line));
      })
    );

    return rows.flat();
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
};

const getLatestTimestamp = (rows) => {
  if (!rows.length) return null;
  const maxTime = rows.reduce((latest, row) => {
    const candidates = [row.processingTime, row.window_end, row.window_start, row.timestamp];
    const candidateTs = candidates
      .map((value) => (value ? new Date(value).getTime() : 0))
      .reduce((acc, current) => (current > acc ? current : acc), 0);
    return candidateTs > latest ? candidateTs : latest;
  }, 0);

  return maxTime ? new Date(maxTime).toISOString() : null;
};

export const getSparkKafkaAnalytics = async () => {
  const [eventTypeRows, topicRows, moderationRows, pipelineRows, recentEventsRows, userActivityRows, kafka] =
    await Promise.all([
    readJsonFiles(path.join(outputRoot, 'event_type_trends')),
    readJsonFiles(path.join(outputRoot, 'topic_trends')),
    readJsonFiles(path.join(outputRoot, 'moderation_trends')),
    readJsonFiles(path.join(outputRoot, 'pipeline_metrics')),
    readJsonFiles(path.join(outputRoot, 'recent_events')),
    readJsonFiles(path.join(outputRoot, 'user_activity_trends')),
    getKafkaMetadata()
  ]);

  const sortedEventTypeRows = eventTypeRows
    .sort((a, b) => new Date(b.window_end) - new Date(a.window_end))
    .slice(0, 60);
  const sortedTopicRows = topicRows
    .sort((a, b) => new Date(b.window_end) - new Date(a.window_end))
    .slice(0, 60);
  const sortedModerationRows = moderationRows
    .sort((a, b) => new Date(b.window_end) - new Date(a.window_end))
    .slice(0, 60);

  const latestPipelineRow = pipelineRows
    .sort((a, b) => new Date(b.processingTime) - new Date(a.processingTime))[0] || null;
  const recentEvents = recentEventsRows
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 30);

  const derivedEventTypeTrends = buildDerivedEventTypeTrends(recentEvents);
  const derivedTopicTrends = buildDerivedTopicTrends(recentEvents);
  const derivedActiveUsers = buildDerivedActiveUsers(recentEvents);
  const topActiveUsers = userActivityRows
    .sort((a, b) => b.eventCount - a.eventCount)
    .slice(0, 20);

  return {
    runtime: {
      sparkEnabled: process.env.SPARK_ANALYTICS_ENABLED === 'true',
      kafkaEnabled: process.env.KAFKA_ENABLED === 'true',
      kafkaTopic: process.env.KAFKA_TOPIC || 'threadapp.events',
      kafkaBrokers: getKafkaBrokers(),
      outputDirectory: outputRoot,
      lastProcessedAt:
        latestPipelineRow?.processingTime ||
        getLatestTimestamp(sortedEventTypeRows) ||
        getLatestTimestamp(sortedTopicRows)
    },
    trends: {
      eventType: sortedEventTypeRows.length ? sortedEventTypeRows : derivedEventTypeTrends,
      topic: sortedTopicRows.length ? sortedTopicRows : derivedTopicTrends,
      moderation: sortedModerationRows
    },
    events: {
      recent: recentEvents
    },
    contributors: {
      activeUsers: topActiveUsers.length ? topActiveUsers : derivedActiveUsers
    },
    kafka,
    pipeline: latestPipelineRow || {
      processingTime: null,
      totalEventsInBatch: 0,
      distinctEventTypes: 0,
      distinctTopics: 0
    }
  };
};

const buildDerivedEventTypeTrends = (events) => {
  const counts = new Map();

  for (const event of events) {
    const key = event.eventType || 'unknown';
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([eventType, eventCount]) => ({
      eventType,
      eventCount,
      window_start: null,
      window_end: null
    }))
    .sort((a, b) => b.eventCount - a.eventCount)
    .slice(0, 20);
};

const buildDerivedTopicTrends = (events) => {
  const counts = new Map();

  for (const event of events) {
    const key = event.topic || 'untagged';
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([topic, eventCount]) => ({
      topic,
      eventCount,
      window_start: null,
      window_end: null
    }))
    .sort((a, b) => b.eventCount - a.eventCount)
    .slice(0, 20);
};

const buildDerivedActiveUsers = (events) => {
  const counts = new Map();

  for (const event of events) {
    if (!event.userId) continue;
    const key = `${event.userId}::${event.userRole || 'unknown'}::${event.eventType || 'unknown'}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([key, eventCount]) => {
      const [userId, userRole, eventType] = key.split('::');
      return {
        userId,
        userRole,
        eventType,
        eventCount,
        window_start: null,
        window_end: null
      };
    })
    .sort((a, b) => b.eventCount - a.eventCount)
    .slice(0, 20);
};

const getKafkaMetadata = async () => {
  if (!isKafkaEnabled()) {
    return {
      connected: false,
      topics: []
    };
  }

  try {
    const admin = await getKafkaAdmin();
    if (!admin) {
      return { connected: false, topics: [] };
    }

    const topicName = getKafkaTopic();
    const topics = await admin.listTopics();
    const metadata = await admin.fetchTopicMetadata({
      topics: topics.includes(topicName) ? [topicName] : undefined
    });

    return {
      connected: true,
      topics: metadata.topics.map((topic) => ({
        name: topic.name,
        partitions: topic.partitions.length,
        partitionIds: topic.partitions.map((partition) => partition.partitionId),
        leaderIds: topic.partitions.map((partition) => partition.leader)
      }))
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message,
      topics: []
    };
  }
};
