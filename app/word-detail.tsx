import Card from "@/components/ui/Card";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WordDetailScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const params = useLocalSearchParams();

  const word = params.word as string;
  const definition = params.definition as string;
  const example = params.example as string;
  const createdAt = params.createdAt as string;
  const updatedAt = params.updatedAt as string;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={[styles.backButtonText, { color: colors.tint }]}>
            ← Back
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Card style={styles.mainCard}>
          <Text style={[styles.wordTitle, { color: colors.text }]}>{word}</Text>
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionLabel, { color: colors.icon }]}>
            Definition
          </Text>
          <Text style={[styles.sectionContent, { color: colors.text }]}>
            {definition || "No definition available"}
          </Text>
        </Card>

        {example && (
          <Card style={styles.sectionCard}>
            <Text style={[styles.sectionLabel, { color: colors.icon }]}>
              Example
            </Text>
            <Text style={[styles.exampleContent, { color: colors.text }]}>
              "{example}"
            </Text>
          </Card>
        )}

        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionLabel, { color: colors.icon }]}>
            Date Information
          </Text>
          <View style={styles.dateRow}>
            <Text style={[styles.dateLabel, { color: colors.icon }]}>
              Created:
            </Text>
            <Text style={[styles.dateValue, { color: colors.text }]}>
              {formatDate(createdAt)}
            </Text>
          </View>
          <View style={styles.dateRow}>
            <Text style={[styles.dateLabel, { color: colors.icon }]}>
              Updated:
            </Text>
            <Text style={[styles.dateValue, { color: colors.text }]}>
              {formatDate(updatedAt)}
            </Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 8,
  },
  mainCard: {
    marginBottom: 16,
    padding: 24,
    alignItems: "center",
  },
  wordTitle: {
    fontSize: 42,
    fontWeight: "bold",
    textAlign: "center",
  },
  sectionCard: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  sectionContent: {
    fontSize: 18,
    lineHeight: 26,
  },
  exampleContent: {
    fontSize: 16,
    fontStyle: "italic",
    lineHeight: 24,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  dateValue: {
    fontSize: 14,
    flex: 1,
    textAlign: "right",
    marginLeft: 16,
  },
});
