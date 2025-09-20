import React, { forwardRef } from "react";
import { toJpeg } from "html-to-image";
import logo from "../assets/logo_ajf.svg";
import { getFormattedDateTime } from "../utils/dateFormat";
import { formatOrderId } from "../utils/orderUtils";

const ReceiptModal = forwardRef(
  (
    {
      orderId,
      customerName,
      customerPhoneNumber,
      itemName,
      quantity,
      unit,
      itemPrice,
      itemTotalPrice,
      itemPriceDiscount,
      paymentHistory,
      remaining,
      onClose,
    },
    ref
  ) => {
    const handleDownload = async () => {
      if (ref.current === null) return;

      try {
        const dataUrl = await toJpeg(ref.current, {
          quality: 1,
          pixelRatio: 3,
        });
        const link = document.createElement("a");
        link.download = "struk.jpg";
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error("Download error:", err);
      }
    };

    const handleShare = async () => {
      if (ref.current === null) return;

      try {
        const blob = await toJpeg(ref.current, {
          quality: 1,
          pixelRatio: 3,
        }).then((dataUrl) => fetch(dataUrl).then((res) => res.blob()));

        const file = new File([blob], "struk.jpg", { type: blob.type });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "Struk Pembayaran",
            text: "Berikut adalah struk belanja Anda.",
            files: [file],
          });
        } else {
          alert("Sharing tidak didukung di perangkat ini.");
        }
      } catch (err) {
        console.error("Share error:", err);
      }
    };

    return (
      <div className="fixed inset-0 z-50 bg-black/70 bg-opacity-50 flex items-center justify-center">
        <div>
          <div
            ref={ref}
            className="bg-white text-black w-[400px] p-4 shadow-md text-[12px] font-mono relative"
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-600 hover:text-black text-xl cursor-pointer"
            >
              ✕
            </button>

            <div className="text-center mb-2">
              <div className="flex justify-center">
                <img
                  src={logo}
                  alt="AJF Logo"
                  className="w-12 h-12 sm:w-14 sm:h-14"
                />
              </div>

              <h2 className="font-bold text-[14px]">Anugerah Jaya Farm</h2>
              <p className="text-[10px]">Jl. Anugerah Jaya Farm 1, Sidodadi</p>
              <p className="text-[10px] mb-1">Jawa Timur | Telp: 08123456789</p>
              <hr className="border-t border-gray-300 my-2" />
            </div>

            <div className="mb-2">
              <p>
                Waktu:{" "}
                <span className="float-right">{getFormattedDateTime()}</span>
              </p>
              <p>
                No Struk:{" "}
                <span className="float-right">
                  AJF - {formatOrderId(orderId)}
                </span>
              </p>
            </div>

            <div className="mb-2">
              <p>
                Pelanggan: <span className="float-right">{customerName}</span>
              </p>
              <p>
                No HP:{" "}
                <span className="float-right">{customerPhoneNumber}</span>
              </p>
            </div>

            <hr className="border-t border-gray-300 my-2" />

            <div className="mb-2">
              <div className="grid grid-cols-5 font-bold border-b pb-1 text-center">
                <span>Item</span>
                <span>Qty</span>
                <span>Unit</span>
                <span>Harga</span>
                <span>Total</span>
              </div>

              <div className="grid grid-cols-5 text-center">
                <span>{itemName}</span>
                <span>{quantity}</span>
                <span>{unit}</span>
                <span>{Number(itemPrice).toLocaleString("id-ID")}</span>
                <span>{Number(itemTotalPrice).toLocaleString("id-ID")}</span>
              </div>
            </div>

            <hr className="border-t border-gray-300 my-2" />

            <div className="text-[12px] mb-3">
              <p>
                Sub Total:{" "}
                <span className="float-right">
                  Rp {Number(itemTotalPrice).toLocaleString("id-ID")}
                </span>
              </p>
              <p>
                Diskon:{" "}
                <span className="float-right">
                  -Rp {Number(itemPriceDiscount).toLocaleString("id-ID")}
                </span>
              </p>
              <p className="font-bold">
                Total:{" "}
                <span className="float-right">
                  Rp{" "}
                  {(itemTotalPrice - itemPriceDiscount).toLocaleString("id-ID")}
                </span>
              </p>
            </div>

            <hr className="my-2 border-dashed" />

            <div>
              {paymentHistory?.map((payment, index) => (
                <div key={index} className="mb-3">
                  <p>
                    Tanggal: <span className="float-right">{payment.date}</span>
                  </p>
                  <p>
                    Metode:{" "}
                    <span className="float-right">{payment.paymentMethod}</span>
                  </p>
                  <p className="font-bold mb-3 flex justify-between">
                    Pembayaran ke-{index + 1}
                    <span className="">
                      Rp {Number(payment.nominal).toLocaleString("id-ID")}
                    </span>
                  </p>
                  <hr className="my-2 border-dashed" />
                </div>
              ))}
            </div>

            <div className="mb-3">
              <p className="font-bold mb-3 flex justify-between">
                Sisa Cicilan:{" "}
                <span className="float-right">
                  Rp {Number(remaining).toLocaleString("id-ID")}
                </span>
              </p>
            </div>

            <hr className="border-t border-gray-300 my-3" />

            <div className="text-center text-[10px]">
              <p>Terima kasih telah berbelanja</p>
              <p>di Anugerah Jaya Farm</p>
            </div>
          </div>
          <div className="mt-3 flex gap-3 justify-between">
            <button
              onClick={handleDownload}
              className="bg-green-700 text-white px-6 py-3 text-xs rounded hover:bg-green-900 cursor-pointer"
            >
              Download
            </button>
            <button
              onClick={handleShare}
              className="bg-green-700 text-white px-4 py-1 text-xs rounded hover:bg-green-900 cursor-pointer"
            >
              Share
            </button>
          </div>
        </div>
      </div>
    );
  }
);

export default ReceiptModal;
