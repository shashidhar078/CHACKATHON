import { Kafka, logLevel } from 'kafkajs';

const kafkaEnabled = process.env.KAFKA_ENABLED === 'true';
const brokers = (process.env.KAFKA_BROKERS || 'localhost:9092')
  .split(',')
  .map((broker) => broker.trim())
  .filter(Boolean);

const clientId = process.env.KAFKA_CLIENT_ID || 'thread-app-backend';
const topic = process.env.KAFKA_TOPIC || 'threadapp.events';

let producer = null;
let isConnected = false;
let admin = null;
let isAdminConnected = false;

const kafka = kafkaEnabled
  ? new Kafka({
      clientId,
      brokers,
      logLevel: process.env.NODE_ENV === 'production' ? logLevel.ERROR : logLevel.WARN
    })
  : null;

export const getKafkaTopic = () => topic;
export const getKafkaBrokers = () => brokers;

export const isKafkaEnabled = () => kafkaEnabled;

export const getKafkaProducer = async () => {
  if (!kafkaEnabled) return null;

  if (!producer) {
    producer = kafka.producer({
      allowAutoTopicCreation: true
    });
  }

  if (!isConnected) {
    await producer.connect();
    isConnected = true;
    console.log(`[Kafka] Connected producer on ${brokers.join(', ')}`);
  }

  return producer;
};

export const disconnectKafkaProducer = async () => {
  if (!producer || !isConnected) return;

  await producer.disconnect();
  isConnected = false;
  console.log('[Kafka] Producer disconnected');
};

export const getKafkaAdmin = async () => {
  if (!kafkaEnabled) return null;

  if (!admin) {
    admin = kafka.admin();
  }

  if (!isAdminConnected) {
    await admin.connect();
    isAdminConnected = true;
    console.log('[Kafka] Admin connected');
  }

  return admin;
};

export const disconnectKafkaAdmin = async () => {
  if (!admin || !isAdminConnected) return;

  await admin.disconnect();
  isAdminConnected = false;
  console.log('[Kafka] Admin disconnected');
};
