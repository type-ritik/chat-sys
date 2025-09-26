import React, { useState } from "react";
import { fetchServer, isValidEmail } from "../services/LoginService";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [payload, setPayload] = useState({ email, password });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg("");
    const target = e.target;
    if (target.id === "email") {
      setEmail(target.value);
    } else {
      setPassword(target.value);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      setErrorMsg("Invalid Email");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("Password length should be greater than 8");
      return;
    }

    setPayload({
      email: email,
      password: password,
    });

    const resData = await fetchServer(payload);
    if (resData.res === false) {
      setErrorMsg(resData.msg);
      return;
    }

    console.log(resData.data.loginUser)
    setErrorMsg("");
  };

  return (
    <div>
      <form onSubmit={(e) => handleSubmit(e)}>
        <div className="entr-email">
          <label htmlFor="email_address">Email</label>
          <input
            type="text"
            placeholder="example@email.com"
            onChange={(e) => handleChange(e)}
            value={email}
            id="email"
            name="email_address"
          />
        </div>
        <div className="entr-pass">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            placeholder="********"
            name="password"
            id="password"
            onChange={(e) => handleChange(e)}
            value={password}
          />
        </div>
        <div className="login">
          <button type="submit">Login</button>
        </div>
      </form>
      {errorMsg ? <div>{errorMsg}</div> : <></>}
    </div>
  );
}

export default LoginPage;
