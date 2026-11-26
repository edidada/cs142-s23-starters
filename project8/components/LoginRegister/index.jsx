import React, { useState } from "react";
import axios from "axios";
function LoginRegister({ onLogin }) {
  const [message, setMessage] = useState("");
  const submit = async (event, registration) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    if (registration && values.password !== values.confirm) { setMessage("Passwords must match"); return; }
    try {
      const { data } = await axios.post(registration ? "/user" : "/admin/login", values);
      if (registration) { form.reset(); setMessage("Registration successful. Please login."); }
      else onLogin(data);
    } catch (error) { setMessage(error.response ? String(error.response.data) : "Network error"); }
  };
  return (
    <section>
      <h1>Login and registration</h1>
      <p role="status">{message}</p>
      <form aria-label="Login" onSubmit={event => submit(event, false)}>
        <label>Login name<input name="login_name" required /></label>
        <label>Password<input name="password" type="password" required /></label>
        <button type="submit">Login</button>
      </form>
      <form aria-label="Registration" onSubmit={event => submit(event, true)}>
        {["login_name", "first_name", "last_name", "location", "description", "occupation"].map(name => (
          <label key={name}>{name}<input name={name} required={["login_name", "first_name", "last_name"].includes(name)} /></label>
        ))}
        <label>Password<input name="password" type="password" required /></label>
        <label>Confirm password<input name="confirm" type="password" required /></label>
        <button type="submit">Register Me</button>
      </form>
    </section>
  );
}
export default LoginRegister;
