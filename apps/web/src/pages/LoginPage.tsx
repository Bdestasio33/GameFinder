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
import { DEMO_USERS, WEB_CLIENT_ROLES } from "@gamefinder/shared";
import { useAuth } from "../auth/AuthProvider.js";
import { canUseWebClient, getRoleHome } from "../auth/role-access.js";

const STAFF_DEMO_USERS = DEMO_USERS.filter((demoUser) =>
  (WEB_CLIENT_ROLES as readonly string[]).includes(demoUser.role),
);

export function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("moderator@gametest.local");
  const [password, setPassword] = useState("mod123");
  const [error, setError] = useState<string | null>(null);

  if (user && canUseWebClient(user.role)) {
    return <Navigate to={getRoleHome(user.role)} replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      const loggedInUser = await login(email, password);
      navigate(getRoleHome(loggedInUser.role));
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
              <Typography variant="h4" component="h1" gutterBottom data-testid="staff-login-heading">
                Staff login
              </Typography>
              <Typography color="text.secondary">
                Web portal for moderators and admins. User accounts sign in through
                the mobile app.
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
                Staff demo accounts
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Click a row to fill the form.
              </Typography>
              <TableContainer data-testid="staff-demo-accounts">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Role</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Password</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {STAFF_DEMO_USERS.map((demoUser) => (
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
