"use client";

import { Formik, Form } from "formik";
import * as Yup from "yup";
import Input from "@/ui-components/Input";
import Button from "@/ui-components/Button";
import { useLogin } from "@/hooks/useAuth";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

const loginFields = [
  {
    label: "Username",
    name: "username",
    type: "text",
    placeholder: "Enter username",
  },
  {
    label: "Password",
    name: "password",
    type: "password",
    placeholder: "Enter password",
  },
];

const validationSchema = Yup.object({
  username: Yup.string().required("Username is required"),
  password: Yup.string().required("Password is required"),
});

const LoginPage = () => {
  const login = useLogin();
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Toaster />
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-zinc-700">
            Metadata Explorer
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex justify-center border-b mb-4">
          <Link
            href="/auth/login"
            className="px-4 py-2 border-b-2 border-teal-600 font-medium text-teal-600"
          >
            Login
          </Link>
          <Link
            href="/auth/sign-up"
            className="px-4 py-2 font-medium text-zinc-600"
          >
            Register
          </Link>
        </div>

        <Formik
          initialValues={{ username: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            console.log(values);
            login.mutate(values, {
              onSuccess: () => {
                toast.success("Login successful!");
                router.push("/dashboard");
              },

              onError: (err: any) => {
                toast.error(
                  err.response?.data?.message || "Invalid credentials"
                );
              },
            });
          }}
        >
          {({ values, handleChange, handleBlur, errors, touched }) => (
            <Form>
              {loginFields.map((field) => (
                <Input
                  key={field.name}
                  {...field}
                  value={values[field.name as keyof typeof values]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors[field.name as keyof typeof errors] || ""}
                  touched={touched[field.name as keyof typeof touched] || false}
                />
              ))}

              <div className="flex items-center justify-between text-sm mb-4">
                <label className="flex items-center text-zinc-600">
                  <input type="checkbox" className="mr-2 accent-teal-700" />
                  Remember me
                </label>
                <Link href="#" className="text-teal-600 hover:underline">
                  Forgot password?
                </Link>
              </div>

              <div className="flex justify-center mb-4">
                <Button
                  type="submit"
                  disabled={login.isPending}
                  className="bg-teal-600 text-white !bg-teal-600 !text-white w-full py-3"
                >
                  {login.isPending ? "Logging in..." : "Login"}
                </Button>
              </div>
            </Form>
          )}
        </Formik>

        <p className="text-sm text-zinc-600 text-center mt-4">
          Not able to login?{" "}
          <Link href="/auth/sign-up" className="text-teal-600 font-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
