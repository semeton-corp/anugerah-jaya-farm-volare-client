import React from "react";
import logo from "../assets/logo_ajf.svg";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { login } from "../services/authServices";
import LoadingScreen from "../components/LoadingScreen";
import { getSelfCurrentUserPresence } from "../services/presence";

const Login = () => {
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function forgotPasswordHandle() {
    navigate("/auth/forgot-password");
  }

  async function loginHandle() {
    setLoading(true);
    setError(null);

    try {
      const response = await login(userName, password);

      if (response.status === 200) {
        const { accessToken, role, photoProfile, name, location, id } =
          response.data.data;
        localStorage.setItem("token", accessToken);
        localStorage.setItem("role", role.name);
        localStorage.setItem("userName", name);
        localStorage.setItem("photoProfile", photoProfile);
        localStorage.setItem("locationId", location.id);
        localStorage.setItem("locationName", location.name);
        localStorage.setItem("userId", id);

        const rolePath = role.name.toLowerCase().replace(/\s+/g, "-");

        const presenceResponse = await getSelfCurrentUserPresence();
        if (presenceResponse.status == 200) {
          console.log(
            "presenceResponse.data.data.status: ",
            presenceResponse.data.data.status
          );
          if (presenceResponse.data.data.status === "Hadir") {
            navigate(`/${rolePath}`);
          } else {
            navigate(`/${rolePath}/presensi`);
          }
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Login gagal. Cek email dan password Anda.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role) {
      const rolePath = role.toLowerCase().replace(/\s+/g, "-");
      navigate(`/${rolePath}`);
    }
  }, []);

  return (
    <div className="relative md:h-screen w-screen">
      {loading && <LoadingScreen />}
      {/* left login item */}
      <div className="absolute left-0 w-full md:w-1/2 h-full flex flex-col  md:justify-center md:p-16 pt-8 px-8 z-10 mt-36 md:mt-0 rounded-t-[56px] bg-white">
        {/* logo & company name */}
        <div className="flex items-center mb-8">
          <img
            src={logo}
            alt="AJF Logo"
            className="md:w-24 md:h-24 w-14 h-14 mr-4"
          />
          <h1 className="md:text-2xl text-base font-bold md:w-60 w-35">
            Anugerah Jaya Farm
          </h1>
        </div>
        {/* welcoming text */}
        <div className="mb-8">
          <p className="text-xl md:text-3xl font-bold">Masuk ke akun anda</p>
          <p className="text-base md:text-lg">
            Platform Monitoring Digital Terintegrasi
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            loginHandle();
          }}
        >
          {/* email field */}
          <div className="mb-4">
            <p className="text-base md:text-lg font-medium">Username</p>
            <input
              type="text"
              placeholder="Masukkan username anda"
              className="w-full p-3 border-2 bg-green-50 border-green-200 placeholder-normal rounded-lg focus:outline-none focus:ring-2 focus:green-400"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>

          {/* password field */}
          <div className="mb-4">
            <p className="text-base md:text-lg font-medium">Kata Sandi</p>
            <input
              type="password"
              id="password"
              placeholder="Masukkan kata sandi anda"
              className="w-full p-3 border-2 bg-green-50 border-green-200 placeholder-normal rounded-lg focus:outline-none focus:ring-2 focus:green-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* lupa password */}
          <div className="flex justify-between mb-4">
            <div></div>
            <p
              onClick={forgotPasswordHandle}
              className="text-sm md:text-base underline text-dark-active cursor-pointer hover:text-light-hover"
            >
              Lupa Password?
            </p>
          </div>

          {/* login button */}
          <div className="">
            <button
              type="submit"
              className="w-full bg-green-700 text-white font-semibold py-3 rounded-lg hover:bg-green-800 transition duration-300"
            >
              Masuk
            </button>
          </div>
        </form>
      </div>
      {/* right login item */}
      <div className="w-full top-0 md:absolute right-0 sm:top-0 md:z-0 md:w-1/2 h-[40%] md:h-full">
        <img
          src="/photo_login_page.png"
          alt="Login Page Photo"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default Login;
