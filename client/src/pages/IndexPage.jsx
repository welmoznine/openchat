import { useCurrentUser } from "../hooks/auth/useCurrentUser";

const IndexPage = () => {

  const { user, loading } = useCurrentUser();

  if (loading) return null;
  if (!user) return null;

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Welcome to OpenChat</h1>
      <p>This is the main page!</p>
      <p>{user.username}</p>
    </div>
  );
};

export default IndexPage;