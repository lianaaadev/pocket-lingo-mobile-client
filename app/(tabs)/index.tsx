import { AuthenticationError, PermissionError } from '@/api/client';
import { vocabularyService } from '@/api/vocabularyService';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { VocabularyResponse } from '@/types/vocabulary.types';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { clearSession } = useAuth();

  const [words, setWords] = useState<VocabularyResponse[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await vocabularyService.getVocabulary(0, 5);
      setWords(response.content);
    } catch (err: any) {
      if (err instanceof AuthenticationError || err instanceof PermissionError) {
        setError('Please log in again. ', err.message);
      } else {
        setError('Failed to load words. ', err.message, ' Please refresh and try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadWords();
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: '#ef4444' }]}>{error}</Text>
        <Button title="Retry" onPress={loadWords} style={{ marginTop: 16 }} />
      </SafeAreaView>
    );
  }

  if (words.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyText, { color: colors.text }]}>
          No words yet. Add some words to get started!
        </Text>
      </SafeAreaView>
    );
  }

  const currentWord = words[currentIndex];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.tint}
          />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Flashcards</Text>
          <Text style={[styles.counter, { color: colors.icon }]}>
            {currentIndex + 1} / {words.length}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleFlip}
          activeOpacity={0.9}
          style={styles.cardContainer}
        >
          <Card style={[styles.flashcard, { borderColor: colors.tint }]}>
            {!isFlipped ? (
              <View style={styles.cardContent}>
                <Text style={[styles.wordText, { color: colors.text }]}>
                  {currentWord.word}
                </Text>
                <Text style={[styles.hint, { color: colors.icon }]}>
                  Tap to see definition
                </Text>
              </View>
            ) : (
              <View style={styles.cardContent}>
                <Text style={[styles.definitionLabel, { color: colors.icon }]}>
                  Definition
                </Text>
                <Text style={[styles.definitionText, { color: colors.text }]}>
                  {currentWord.definition || 'No definition available'}
                </Text>
                {currentWord.example && (
                  <>
                    <Text
                      style={[
                        styles.exampleLabel,
                        { color: colors.icon, marginTop: 16 },
                      ]}
                    >
                      Example
                    </Text>
                    <Text style={[styles.exampleText, { color: colors.text }]}>
                      {currentWord.example}
                    </Text>
                  </>
                )}
              </View>
            )}
          </Card>
        </TouchableOpacity>

        <View style={styles.controls}>
          <Button
            title="Previous"
            onPress={handlePrevious}
            disabled={currentIndex === 0}
            variant="outline"
            style={styles.navButton}
          />
          <Button
            title="Next"
            onPress={handleNext}
            disabled={currentIndex === words.length - 1}
            style={styles.navButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  counter: {
    fontSize: 16,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashcard: {
    width: width - 40,
    minHeight: 300,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  cardContent: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordText: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  hint: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  definitionLabel: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  definitionText: {
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 28,
  },
  exampleLabel: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  navButton: {
    flex: 1,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
  },
});
