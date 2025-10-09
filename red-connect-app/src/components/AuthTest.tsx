import { useAuth, useUser } from "@clerk/clerk-react";

export function AuthTest() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 bg-card border border-border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Auth Test</h2>
      <div className="space-y-2">
        <p><strong>Authentication Status:</strong> {isSignedIn ? "