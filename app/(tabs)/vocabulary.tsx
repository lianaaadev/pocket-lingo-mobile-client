import { AuthenticationError, PermissionError } from "@/api/client";
import { vocabularyService } from "@/api/vocabularyService";
import Card from "@/components/ui/Card";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { VocabularyResponse } from "@/types/vocabulary.types";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VocabularyScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [words, setWords] = useState<VocabularyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = async (pageNum: number = 0, append: boolean = false) => {
    try {
      if (!append) {
        setLoading(true);
      }
      setError(null);

      const response = await vocabularyService.getVocabulary(pageNum, 20);

      if (append) {
        setWords((prev) => [...prev, ...response.content]);
      } else {
        setWords(response.content);
      }

      setHasMore(!response.last);
      setPage(pageNum);
    } catch (err: any) {
      if (
        err instanceof AuthenticationError ||
        err instanceof PermissionError
      ) {
        setError("Please log in again.", err.message);
      } else {
        setError(
          "Failed to load words.",
          err.message,
          "Please refresh and try again."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadWords(0, false);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadWords(page + 1, true);
    }
  };

  const handleDelete = (word: VocabularyResponse) => {
    Alert.alert(
      "Delete Word",
      `Are you sure you want to delete "${word.word}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await vocabularyService.deleteVocabulary(word.id);
              setWords((prev) => prev.filter((w) => w.id !== word.id));
            } catch (err: any) {
              Alert.alert("Failed to delete word.", err.message || "Please try again.");
            }
          },
        },
      ]
    );
  };

  const handleWordPress = (item: VocabularyResponse) => {
    router.push({
      pathname: "/word-detail",
      params: {
        word: item.word,
        definition: item.definition,
        example: item.example,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      },
    });
  };

  const renderWordItem = ({ item }: { item: VocabularyResponse }) => (
    <TouchableOpacity
      onPress={() => handleWordPress(item)}
      onLongPress={() => handleDelete(item)}
      activeOpacity={0.7}
    >
      <Card style={styles.wordCard}>
        <View style={styles.wordHeader}>
          <Text style={[styles.word, { color: colors.text }]}>{item.word}</Text>
        </View>
        {item.definition && (
          <Text style={[styles.definition, { color: colors.text }]}>
            {item.definition}
          </Text>
        )}
        {item.example && (
          <Text style={[styles.example, { color: colors.icon }]}>
            "{item.example}"
          </Text>
        )}
        <Text style={[styles.date, { color: colors.icon }]}>
          Added {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </Card>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: colors.text }]}>
        No words yet. Add some words to get started!
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loading || words.length === 0) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator color={colors.tint} />
      </View>
    );
  };

  if (loading && words.length === 0) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={colors.tint} />
      </SafeAreaView>
    );
  }

  if (error && words.length === 0) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.errorText, { color: "#ef4444" }]}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>All Words</Text>
        <Text style={[styles.count, { color: colors.icon }]}>
          {words.length} word{words.length !== 1 ? "s" : ""}
        </Text>
      </View>

      <FlatList
        data={words}
        renderItem={renderWordItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.tint}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 4,
  },
  count: {
    fontSize: 16,
  },
  list: {
    padding: 20,
    paddingTop: 8,
  },
  wordCard: {
    marginBottom: 16,
  },
  wordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  word: {
    fontSize: 24,
    fontWeight: "bold",
  },
  definition: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
  },
  example: {
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 20,
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
  },
  footer: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
