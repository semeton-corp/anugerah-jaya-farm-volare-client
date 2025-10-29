import React from "react";
import logo from "../assets/logo_ajf.svg";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Verification = () => {
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [showButton, setShowButton] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (secondsLeft > 0) {
      const interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setShowButton(true);
    }
  }, [secondsLeft]);

  const handleResend = () => {
    console.log("Resend email clicked");
    setSecondsLeft(60);
    setShowButton(false);
  };

  const backHandle = () => {
    navigate("/auth/login");
  };

  const formatTime = () => {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex h-screen justify-center mt-18 md:mt-48  px-4">
      <div className="w-full max-w-[720px] p-4 md:p-0">
        <div className="mb-6">
          <img
            src={logo}
            alt="AJF Logo"
            className=" md:w-24 md:h-24 w-14 h-14"
          />
          <p className="text-xl md:text-3xl font-bold mt-4">
            Email sudah dikirimkan ke email anda
          </p>
          <p className="text-base md:text-lg text-gray-600">
            Cek instruksi atur ulang akun pada email yang sudah dikirimkan
          </p>
        </div>

        <div className="mt-4 text-center">
          {showButton ? (
            <button
              onClick={handleResend}
              className="text-green-700 font-semibold underline hover:text-green-300 cursor-pointer"
            >
              Kirim Ulang Email
            </button>
          ) : (
            <p className="text-light-hover">
              Kirim Ulang Email dalam{" "}
              <span className="font-semibold">{formatTime()}</span>
            </p>
          )}
        </div>

        {/* buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => backHandle()}
            className="cursor-pointer bg-green-200 text-base font-medium border-green-400 py-3 px-6 w-full rounded-lg hover:bg-green-300 transition duration-300"
          >
            Kembali ke halaman masuk
          </button>
        </div>
      </div>
    </div>
  );
};

export default Verification;
