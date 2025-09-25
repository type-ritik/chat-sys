import { useState, useEffect } from "react";
import { fetchServer } from "../services/LoginService";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [payload, setPayload] = useState({ email, password });

  const handleSubmit = (e) => {
    e.preventDefault();

    setPayload({
      email: email,
      password: password,
    });

    fetchServer(payload);
  };

  return (
    <div>
      <form onSubmit={(e) => handleSubmit(e)}>
        <div className="entr-email">
          <label htmlFor="email_address">Email</label>
          <input
            type="text"
            placeholder="example@email.com"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            name="email_address"
          />
        </div>
        <div className="entr-pass">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            placeholder="********"
            name="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
        </div>
        <div className="login">
          <button type="submit">Login</button>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
