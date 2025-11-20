import { createSignal, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { action, redirect } from "@solidjs/router";
import { login, register, getUser } from "~/lib/auth";

const loginAction = action(async (formData: FormData) => {
  "use server";
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await login(email, password);
    return redirect("/character-select");
  } catch (error: any) {
    return { error: error.message };
  }
});

const registerAction = action(async (formData: FormData) => {
  "use server";
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await register(email, password);
    return redirect("/character-select");
  } catch (error: any) {
    return { error: error.message };
  }
});

export default function Home() {
  const [isRegister, setIsRegister] = createSignal(false);
  const [error, setError] = createSignal("");
  const navigate = useNavigate();

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError("");

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const result = isRegister() 
        ? await registerAction(formData)
        : await loginAction(formData);

      if (result?.error) {
        setError(result.error);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    }
  };

  return (
    <div class="container">
      <div style={{ "max-width": "400px", margin: "4rem auto" }}>
        <h1 class="title" style={{ "text-align": "center", "margin-bottom": "2rem" }}>
          Fantasy RPG
        </h1>

        <div class="card">
          <h2 style={{ "margin-bottom": "1.5rem" }}>
            {isRegister() ? "Create Account" : "Login"}
          </h2>

          <Show when={error()}>
            <div class="error">{error()}</div>
          </Show>

          <form onSubmit={handleSubmit}>
            <div>
              <label>Email</label>
              <input
                type="email"
                name="email"
                required
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label>Password</label>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <button type="submit" class="button" style={{ width: "100%" }}>
              {isRegister() ? "Register" : "Login"}
            </button>
          </form>

          <p style={{ "text-align": "center", "margin-top": "1rem" }}>
            <button
              class="button secondary"
              onClick={() => setIsRegister(!isRegister())}
              style={{ width: "100%" }}
            >
              {isRegister()
                ? "Already have an account? Login"
                : "Need an account? Register"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
