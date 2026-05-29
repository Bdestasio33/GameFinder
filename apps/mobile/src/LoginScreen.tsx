import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Input, Text } from "@rneui/themed";
import { DEMO_USERS, MOBILE_CLIENT_ROLES } from "@gamefinder/shared";
import { login, type SessionUser } from "./api-client";

const MOBILE_DEMO_USERS = DEMO_USERS.filter((demoUser) =>
  (MOBILE_CLIENT_ROLES as readonly string[]).includes(demoUser.role),
);

type LoginScreenProps = {
  onLogin: (token: string, user: SessionUser) => void;
};

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState("user@gametest.local");
  const [password, setPassword] = useState("user123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      const result = await login(email, password);
      onLogin(result.token, result.user);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Login failed",
      );
    } finally {
      setLoading(false);
    }
  }

  function fillCredentials(demoEmail: string, demoPassword: string) {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card containerStyle={styles.card}>
        <Text h3 style={styles.title}>
          Sign in
        </Text>
        <Text style={styles.subtitle}>
          Mobile app for user accounts. Moderators and admins use the web staff
          portal.
        </Text>

        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          title="Sign in"
          onPress={() => void handleSubmit()}
          loading={loading}
          buttonStyle={styles.button}
        />

        <Text style={styles.tableTitle}>User demo accounts</Text>
        <Text style={styles.tableHint}>Tap a row to fill the form.</Text>

        <View style={styles.table}>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.cell, styles.headerCell, styles.roleCell]}>
              Role
            </Text>
            <Text style={[styles.cell, styles.headerCell, styles.emailCell]}>
              Email
            </Text>
            <Text style={[styles.cell, styles.headerCell, styles.passwordCell]}>
              Password
            </Text>
          </View>
          {MOBILE_DEMO_USERS.map((demoUser) => (
            <Pressable
              key={demoUser.email}
              style={styles.dataRow}
              onPress={() =>
                fillCredentials(demoUser.email, demoUser.password)
              }
            >
              <Text style={[styles.cell, styles.roleCell]}>
                {demoUser.role}
              </Text>
              <Text style={[styles.cell, styles.emailCell]}>
                {demoUser.email}
              </Text>
              <Text style={[styles.cell, styles.passwordCell, styles.mono]}>
                {demoUser.password}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#f7f4ef",
    flexGrow: 1,
    justifyContent: "center",
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  title: {
    marginBottom: 8,
    textAlign: "left",
  },
  subtitle: {
    color: "#4b5563",
    marginBottom: 16,
  },
  error: {
    color: "#b91c1c",
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#3730a3",
    borderRadius: 8,
    marginTop: 8,
  },
  tableTitle: {
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 4,
  },
  tableHint: {
    color: "#6b7280",
    marginBottom: 12,
    fontSize: 13,
  },
  table: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  headerRow: {
    backgroundColor: "#f9fafb",
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  dataRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  cell: {
    fontSize: 12,
    color: "#1f2933",
  },
  headerCell: {
    fontWeight: "600",
    color: "#4b5563",
  },
  roleCell: {
    width: "22%",
  },
  emailCell: {
    width: "48%",
  },
  passwordCell: {
    width: "30%",
  },
  mono: {
    fontFamily: "Courier",
  },
});
