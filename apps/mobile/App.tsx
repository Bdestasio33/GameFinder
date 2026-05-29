import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { healthResponseSchema } from "@gamefinder/shared";

const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001";

type GameListItem = {
  id: string;
  title: string;
  description: string | null;
  minPlayers: number;
  maxPlayers: number;
};

export default function App() {
  const [health, setHealth] = useState("checking...");
  const [games, setGames] = useState<GameListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const healthResponse = await fetch(`${apiUrl}/health`);
        const healthJson = healthResponseSchema.parse(await healthResponse.json());
        setHealth(`${healthJson.service} (${healthJson.database})`);

        const gamesResponse = await fetch(`${apiUrl}/api/games`);
        setGames((await gamesResponse.json()) as GameListItem[]);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to reach the API",
        );
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>GameFinder</Text>
        <Text style={styles.title}>Mobile scaffold</Text>
        <Text style={styles.body}>
          Expo app wired to the shared API and domain packages.
        </Text>
        <Text style={styles.status}>API status: {health}</Text>

        {loading ? <ActivityIndicator /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {!loading && !error
          ? games.map((game) => (
              <View key={game.id} style={styles.card}>
                <Text style={styles.cardTitle}>{game.title}</Text>
                <Text style={styles.cardMeta}>
                  {game.minPlayers}-{game.maxPlayers} players
                </Text>
                {game.description ? (
                  <Text style={styles.cardBody}>{game.description}</Text>
                ) : null}
              </View>
            ))
          : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f4ef",
  },
  content: {
    padding: 24,
    gap: 12,
  },
  eyebrow: {
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#6b7280",
    fontSize: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1f2933",
  },
  body: {
    color: "#374151",
    lineHeight: 22,
  },
  status: {
    color: "#4b5563",
  },
  error: {
    color: "#b91c1c",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardMeta: {
    color: "#6b7280",
    marginBottom: 8,
  },
  cardBody: {
    color: "#374151",
    lineHeight: 20,
  },
});
