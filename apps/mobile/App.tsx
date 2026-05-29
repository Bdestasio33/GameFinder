import { ThemeProvider, createTheme } from "@rneui/themed";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Button } from "@rneui/themed";
import { API_URL, logout, type SessionUser } from "./src/api-client";
import { LoginScreen } from "./src/LoginScreen";

const rneTheme = createTheme({
  lightColors: {
    primary: "#3730a3",
  },
});

type VideoGame = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  releaseYear: number | null;
  minAgeRecommendation: number | null;
  difficultyLevel: string;
  expertiseRequired: string;
  genres: Array<{ name: string; slug: string }>;
  platforms: Array<{ name: string; slug: string }>;
  playStyles: string[];
};

function CatalogApp() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [games, setGames] = useState<VideoGame[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    async function load() {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/games`);
        setGames((await response.json()) as VideoGame[]);
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
  }, [token]);

  async function handleLogout() {
    if (token) {
      try {
        await logout(token);
      } catch {
        // Ignore network errors during logout
      }
    }
    setToken(null);
    setUser(null);
    setGames([]);
    setSelectedSlug(null);
    setSearch("");
    setError(null);
  }

  const filteredGames = useMemo(
    () =>
      games.filter((game) =>
        game.title.toLowerCase().includes(search.toLowerCase()),
      ),
    [games, search],
  );

  const selectedGame =
    games.find((game) => game.slug === selectedSlug) ?? null;

  if (!token || !user) {
    return (
      <LoginScreen
        onLogin={(nextToken, nextUser) => {
          setToken(nextToken);
          setUser(nextUser);
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>GameFinder</Text>
            <Text style={styles.title}>Video game catalog</Text>
            <Text style={styles.body}>
              Signed in as {user.displayName} · {user.role}
            </Text>
          </View>
          <Button
            title="Logout"
            type="outline"
            onPress={() => void handleLogout()}
            buttonStyle={styles.logoutButton}
            titleStyle={styles.logoutTitle}
          />
        </View>

        {loading ? <ActivityIndicator /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {!selectedGame ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Search by title"
              value={search}
              onChangeText={setSearch}
            />
            {filteredGames.map((game) => (
              <Pressable
                key={game.id}
                style={styles.card}
                onPress={() => setSelectedSlug(game.slug)}
              >
                <Text style={styles.cardTitle}>{game.title}</Text>
                <Text style={styles.cardMeta}>
                  {game.releaseYear ?? "?"} · Age {game.minAgeRecommendation ?? "?"}+
                </Text>
                <Text style={styles.cardBody}>{game.description}</Text>
                <View style={styles.pillRow}>
                  {game.genres.slice(0, 2).map((genre) => (
                    <Text key={genre.slug} style={styles.pill}>
                      {genre.name}
                    </Text>
                  ))}
                </View>
              </Pressable>
            ))}
          </>
        ) : (
          <View style={styles.card}>
            <Pressable onPress={() => setSelectedSlug(null)}>
              <Text style={styles.backLink}>← Back to catalog</Text>
            </Pressable>
            <Text style={styles.cardTitle}>{selectedGame.title}</Text>
            <Text style={styles.cardMeta}>
              {selectedGame.difficultyLevel} · {selectedGame.expertiseRequired}
            </Text>
            <Text style={styles.cardBody}>{selectedGame.description}</Text>
            <Text style={styles.cardMeta}>
              Platforms: {selectedGame.platforms.map((p) => p.name).join(", ")}
            </Text>
            <Text style={styles.cardMeta}>
              Play styles: {selectedGame.playStyles.join(", ")}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={rneTheme}>
      <CatalogApp />
    </ThemeProvider>
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
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 8,
  },
  logoutButton: {
    borderColor: "#3730a3",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  logoutTitle: {
    color: "#3730a3",
    fontSize: 14,
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
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderColor: "#e5e7eb",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
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
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  cardMeta: {
    color: "#6b7280",
  },
  cardBody: {
    color: "#374151",
    lineHeight: 20,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    backgroundColor: "#eef2ff",
    color: "#3730a3",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: "hidden",
    fontSize: 12,
  },
  backLink: {
    color: "#3730a3",
    marginBottom: 8,
  },
});
