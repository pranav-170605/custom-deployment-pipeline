"use client";

import { Formik, Form } from "formik";
import * as Yup from "yup";
import Input from "@/ui-components/Input";
import Button from "@/ui-components/Button";
import { useRegister } from "@/hooks/useAuth";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/context/UserContext";

const registerFields = [
  {
    label: "Username",
    name: "username",
    type: "text",
    placeholder: "Enter username",
  },
  { label: "Email", name: "email", type: "email", placeholder: "Enter email" },
  {
    label: "Password",
    name: "password",
    type: "password",
    placeholder: "Enter password",
  },
];

const validationSchema = Yup.object({
  username: Yup.string().required("Username is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const RegisterPage = () => {
  const register = useRegister();
  const router = useRouter();
  const { setUserId } = useUser();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Toaster />
      <div className="bg-white card p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-zinc-700">
            Metadata Explorer
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex justify-center border-b mb-4">
          <Link
            href="/auth/login"
            className="px-4 py-2 font-medium text-zinc-600 hover:text-zinc-900"
          >
            Login
          </Link>
          <Link
            href="/auth/register"
            className="px-4 py-2 border-b-2 border-teal-600 font-medium text-teal-600"
          >
            Register
          </Link>
        </div>

        <Formik
          initialValues={{ username: "", email: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={(values, { resetForm }) => {
            register.mutate(values, {
              onSuccess: ({ user_id }: any) => {
                toast.success("Registered successfully!");
                localStorage.setItem("userId", user_id);
                setUserId(user_id);
                console.log("Stored userId in localStorage:", user_id);
                console.log("Context userId after setUserId:", user_id);

                resetForm();
                setTimeout(() => router.push("/auth/login"), 1500);
              },
              onError: (err: any) => {
                toast.error(
                  err.response?.data?.message || "Something went wrong"
                );
              },
            });
          }}
        >
          {({ values, handleChange, handleBlur, errors, touched }) => (
            <Form>
              {registerFields.map((field) => (
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

              <div className="flex justify-center mb-4">
                <Button
                  type="submit"
                  disabled={register.isPending}
                  className="bg-teal-600 text-white !bg-teal-600 !text-white w-full py-3"
                >
                  {register.isPending ? "Registering..." : "Register"}
                </Button>
              </div>
            </Form>
          )}
        </Formik>

        <p className="text-sm text-center mt-4 text-zinc-600">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-teal-600 hover:text-teal-700 font-medium"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
