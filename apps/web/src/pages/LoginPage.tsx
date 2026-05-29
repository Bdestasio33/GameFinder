import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { DEMO_USERS } from "@gamefinder/shared";
import { useAuth } from "../auth/AuthProvider.js";

export function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("user@gametest.local");
  const [password, setPassword] = useState("user123");
  const [error, setError] = useState<string | null>(null);

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate("/");
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Login failed",
      );
    }
  }

  function fillCredentials(demoEmail: string, demoPassword: string) {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
  }

  return (
    <Box sx={{ maxWidth: 640, mx: "auto" }}>
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                Login
              </Typography>
              <Typography color="text.secondary">
                Demo auth for the GameFinder testbed. Not production-ready.
              </Typography>
            </Box>

            <Box component="form" onSubmit={(event) => void handleSubmit(event)}>
              <Stack spacing={2}>
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  fullWidth
                  required
                />
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  fullWidth
                  required
                />
                {error ? <Alert severity="error">{error}</Alert> : null}
                <Button type="submit" variant="contained" size="large">
                  Sign in
                </Button>
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Demo accounts
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Click a row to fill the form.
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Role</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Password</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {DEMO_USERS.map((demoUser) => (
                      <TableRow
                        key={demoUser.email}
                        hover
                        sx={{ cursor: "pointer" }}
                        onClick={() =>
                          fillCredentials(demoUser.email, demoUser.password)
                        }
                      >
                        <TableCell>{demoUser.role}</TableCell>
                        <TableCell>{demoUser.email}</TableCell>
                        <TableCell>
                          <Typography component="span" fontFamily="monospace">
                            {demoUser.password}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
