import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignInForm } from "@/components/auth/sign-in-form";

const signInAction = vi.hoisted(() => vi.fn());
vi.mock("@/lib/actions/auth", () => ({ signInAction }));

describe("SignInForm", () => {
  it("shows validation errors without calling the server", async () => {
    const user = userEvent.setup();
    render(<SignInForm />);

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(
      await screen.findByText("Enter a valid email address."),
    ).toBeInTheDocument();
    expect(screen.getByText("Enter your password.")).toBeInTheDocument();
    expect(signInAction).not.toHaveBeenCalled();
  });

  it("submits normalised credentials with the callback URL", async () => {
    const user = userEvent.setup();
    signInAction.mockResolvedValue(undefined);
    render(<SignInForm callbackUrl="/settings" />);

    await user.type(screen.getByLabelText("Email"), "Ada@Example.com");
    await user.type(screen.getByLabelText("Password"), "Password123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(signInAction).toHaveBeenCalledWith(
      { email: "ada@example.com", password: "Password123" },
      "/settings",
    );
  });

  it("displays the error returned by the server", async () => {
    const user = userEvent.setup();
    signInAction.mockResolvedValue({
      ok: false,
      error: "Incorrect email or password.",
    });
    render(<SignInForm />);

    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Password"), "wrong");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Incorrect email or password.",
    );
  });
});

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
