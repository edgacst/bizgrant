package com.granthunter.collector;

import com.fasterxml.jackson.databind.JsonNode;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

final class G2bSyncSupport {

    private G2bSyncSupport() {}

    record DateTimeRange(LocalDateTime start, LocalDateTime end) {}

    static List<DateTimeRange> chunkRange(LocalDateTime end, int lookbackDays, int chunkDays) {
        if (chunkDays < 1) chunkDays = 14;
        LocalDateTime rangeStart = end.minusDays(lookbackDays);
        List<DateTimeRange> chunks = new ArrayList<>();
        LocalDateTime cursor = rangeStart;
        while (cursor.isBefore(end)) {
            LocalDateTime chunkEnd = cursor.plusDays(chunkDays).minusMinutes(1);
            if (chunkEnd.isAfter(end)) {
                chunkEnd = end;
            }
            chunks.add(new DateTimeRange(cursor, chunkEnd));
            cursor = cursor.plusDays(chunkDays);
        }
        return chunks;
    }

    static List<JsonNode> extractItemNodes(JsonNode body) {
        if (body == null || body.isMissingNode()) {
            return List.of();
        }
        JsonNode itemsNode = body.path("items");
        if (itemsNode.isMissingNode() || itemsNode.isNull()) {
            return List.of();
        }

        List<JsonNode> nodes = new ArrayList<>();
        if (itemsNode.isArray()) {
            itemsNode.forEach(nodes::add);
            return nodes;
        }

        JsonNode item = itemsNode.path("item");
        if (item.isArray()) {
            item.forEach(nodes::add);
        } else if (!item.isMissingNode() && !item.isNull()) {
            nodes.add(item);
        } else if (itemsNode.isObject()) {
            nodes.add(itemsNode);
        }
        return nodes;
    }
}
