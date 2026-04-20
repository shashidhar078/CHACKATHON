from pyspark.sql import SparkSession
from pyspark.sql.functions import (
    col,
    from_json,
    window,
    current_timestamp,
    approx_count_distinct
)
from pyspark.sql.types import StructType, StructField, StringType, MapType


KAFKA_BOOTSTRAP_SERVERS = "kafka:29092"
KAFKA_TOPIC = "threadapp.events"
CHECKPOINT_ROOT = "/workspace/analytics/output/checkpoints"
OUTPUT_ROOT = "/workspace/analytics/output"


event_schema = StructType([
    StructField("eventId", StringType(), True),
    StructField("eventType", StringType(), True),
    StructField("timestamp", StringType(), True),
    StructField("userId", StringType(), True),
    StructField("userRole", StringType(), True),
    StructField("entityType", StringType(), True),
    StructField("entityId", StringType(), True),
    StructField("topic", StringType(), True),
    StructField("status", StringType(), True),
    StructField("metadata", MapType(StringType(), StringType()), True)
])


def build_session():
    return (
        SparkSession.builder.appName("ThreadAppStreamingAnalytics")
        .getOrCreate()
    )


def main():
    spark = build_session()
    spark.sparkContext.setLogLevel("WARN")

    raw_stream = (
        spark.readStream.format("kafka")
        .option("kafka.bootstrap.servers", KAFKA_BOOTSTRAP_SERVERS)
        .option("subscribe", KAFKA_TOPIC)
        .option("startingOffsets", "latest")
        .load()
    )

    parsed = (
        raw_stream.selectExpr("CAST(value AS STRING) AS json_payload")
        .select(from_json(col("json_payload"), event_schema).alias("event"))
        .select("event.*")
        .withColumn("eventTime", col("timestamp").cast("timestamp"))
        .filter(col("eventTime").isNotNull())
    )
    parsed_with_watermark = parsed.withWatermark("eventTime", "10 minutes")

    event_type_trends = (
        parsed_with_watermark.groupBy(
            window(col("eventTime"), "5 minutes", "1 minute"),
            col("eventType")
        )
        .count()
        .select(
            col("window.start").alias("window_start"),
            col("window.end").alias("window_end"),
            col("eventType"),
            col("count").alias("eventCount")
        )
    )

    topic_trends = (
        parsed_with_watermark.filter(col("topic").isNotNull())
        .groupBy(
            window(col("eventTime"), "5 minutes", "1 minute"),
            col("topic")
        )
        .count()
        .select(
            col("window.start").alias("window_start"),
            col("window.end").alias("window_end"),
            col("topic"),
            col("count").alias("eventCount")
        )
    )

    moderation_trends = (
        parsed_with_watermark.filter(col("status").isin("flagged", "approved"))
        .groupBy(
            window(col("eventTime"), "5 minutes", "1 minute"),
            col("status")
        )
        .count()
        .select(
            col("window.start").alias("window_start"),
            col("window.end").alias("window_end"),
            col("status").alias("moderationStatus"),
            col("count").alias("eventCount")
        )
    )

    pipeline_metrics = (
        parsed_with_watermark
        .groupBy(window(col("eventTime"), "1 minute"))
        .agg(
            approx_count_distinct("eventType").alias("distinctEventTypes"),
            approx_count_distinct("topic").alias("distinctTopics"),
            approx_count_distinct("eventId").alias("totalEventsInBatch")
        )
        .select(
            current_timestamp().alias("processingTime"),
            col("distinctEventTypes"),
            col("distinctTopics"),
            col("totalEventsInBatch")
        )
    )

    recent_events = (
        parsed.select(
            "eventId",
            "eventType",
            "timestamp",
            "userId",
            "userRole",
            "entityType",
            "entityId",
            "topic",
            "status"
        )
    )

    user_activity_trends = (
        parsed_with_watermark.filter(col("userId").isNotNull())
        .groupBy(
            window(col("eventTime"), "5 minutes", "1 minute"),
            col("userId"),
            col("userRole"),
            col("eventType")
        )
        .count()
        .select(
            col("window.start").alias("window_start"),
            col("window.end").alias("window_end"),
            col("userId"),
            col("userRole"),
            col("eventType"),
            col("count").alias("eventCount")
        )
    )

    queries = [
        event_type_trends.writeStream.outputMode("append")
        .format("json")
        .option("path", f"{OUTPUT_ROOT}/event_type_trends")
        .option("checkpointLocation", f"{CHECKPOINT_ROOT}/event_type_trends")
        .start(),
        topic_trends.writeStream.outputMode("append")
        .format("json")
        .option("path", f"{OUTPUT_ROOT}/topic_trends")
        .option("checkpointLocation", f"{CHECKPOINT_ROOT}/topic_trends")
        .start(),
        moderation_trends.writeStream.outputMode("append")
        .format("json")
        .option("path", f"{OUTPUT_ROOT}/moderation_trends")
        .option("checkpointLocation", f"{CHECKPOINT_ROOT}/moderation_trends")
        .start(),
        pipeline_metrics.writeStream.outputMode("append")
        .format("json")
        .option("path", f"{OUTPUT_ROOT}/pipeline_metrics")
        .option("checkpointLocation", f"{CHECKPOINT_ROOT}/pipeline_metrics")
        .start(),
        recent_events.writeStream.outputMode("append")
        .format("json")
        .option("path", f"{OUTPUT_ROOT}/recent_events")
        .option("checkpointLocation", f"{CHECKPOINT_ROOT}/recent_events")
        .start(),
        user_activity_trends.writeStream.outputMode("append")
        .format("json")
        .option("path", f"{OUTPUT_ROOT}/user_activity_trends")
        .option("checkpointLocation", f"{CHECKPOINT_ROOT}/user_activity_trends")
        .start()
    ]

    for query in queries:
        query.awaitTermination()


if __name__ == "__main__":
    main()
