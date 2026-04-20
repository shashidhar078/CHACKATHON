import { randomUUID } from 'crypto';
import { getKafkaProducer, getKafkaTopic, isKafkaEnabled } from '../config/kafka.js';

const normalizeDate = (value) => {
  if (!value) return new Date().toISOString();
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
};

export const publishAnalyticsEvent = async (event) => {
  if (!isKafkaEnabled()) return false;

  try {
    const producer = await getKafkaProducer();
    if (!producer) return false;

    const payload = {
      eventId: randomUUID(),
      eventType: event.eventType || 'unknown_event',
      timestamp: normalizeDate(event.timestamp),
      userId: event.userId || null,
      userRole: event.userRole || 'unknown',
      entityType: event.entityType || null,
      entityId: event.entityId || null,
      topic: event.topic || null,
      status: event.status || null,
      metadata: event.metadata || {}
    };

    await producer.send({
      topic: getKafkaTopic(),
      messages: [
        {
          key: payload.eventType,
          value: JSON.stringify(payload)
        }
      ]
    });

    return true;
  } catch (error) {
    console.error('[Kafka] Failed to publish analytics event:', error.message);
    return false;
  }
};
