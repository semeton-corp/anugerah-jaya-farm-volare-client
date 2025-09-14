import { Home, Settings, Menu } from "lucide-react";
import overview from "../assets/icon_nav/icon_nav_overview.svg";
import penjualan from "../assets/icon_nav/icon_nav_penjualan.svg";
import produksiTelur from "../assets/icon_nav/icon_nav_produksi_telur.svg";
import ayam from "../assets/icon_nav/icon_nav_ayam.svg";
import kinerja from "../assets/icon_nav/icon_nav_kinerja.svg";
import gudang from "../assets/icon_nav/icon_nav_gudang.svg";
import toko from "../assets/icon_nav/icon_nav_toko.svg";
import kelolaPegawai from "../assets/icon_nav/icon_nav_kelola_pegawai.svg";
import cashflow from "../assets/icon_nav/icon_nav_cashflow.svg";
import { GrNotes } from "react-icons/gr";
import OverviewOwner from "../pages/OverviewOwner";
import Penjualan from "../pages/Penjualan";
import ProduksiTelur from "../pages/ProduksiTelur";
import { BsPersonSquare } from "react-icons/bs";
import { GiTempleDoor } from "react-icons/gi";
import { FaJarWheat } from "react-icons/fa6";

export const sidebarMenus = {
  Owner: [
    {
      icon: <img src={overview} alt="Overview Icon" className="h-4 w-4" />,
      tabName: "Ringkasan",
      element: <OverviewOwner />,
    },
    {
      icon: <img src={penjualan} alt="Overview Icon" className="h-4 w-4" />,
      tabName: "Penjualan",
      element: <Penjualan />,
    },
    {
      icon: <img src={produksiTelur} alt="Overview Icon" className="h-4 w-4" />,
      tabName: "Produksi Telur",
      element: <ProduksiTelur />,
      subTabs: [
        { tabName: "Ringkasan Produksi", path: "overview-produksi" },
        { tabName: "Data Produksi Telur", path: "data-produksi-telur" },
      ],
    },
    {
      icon: <img src={ayam} alt="ayam Icon" className="h-4 w-4" />,
      tabName: "Ayam",
      element: <OverviewOwner />,
      subTabs: [
        { tabName: "Ringkasan Ayam", path: "overview-ayam" },
        { tabName: "Data Ayam", path: "data-ayam" },
        { tabName: "Vaksin & Obat", path: "detail-vaksin-&-obat" },
      ],
    },
    {
      icon: <img src={kinerja} alt="Overview Icon" className="h-4 w-4" />,
      tabName: "Kinerja",
      element: <OverviewOwner />,
      subTabs: [
        { tabName: "Ringkasan Kinerja", path: "ringkasan-kinerja" },
        { tabName: "Detail Kinerja Ayam", path: "detail-kinerja-ayam" },
        { tabName: "Pengadaan DOC", path: "detail-kinerja-ayam" },
        { tabName: "Jual Ayam Afkir", path: "detail-kinerja-ayam" },
      ],
    },
    {
      icon: <FaJarWheat size={20} />,
      tabName: "Pakan",
      element: <OverviewOwner />,
      subTabs: [
        { tabName: "Pembagian Pakan", path: "pembagian-pakan" },
        { tabName: "Formula Pakan", path: "formula-pakan" },
      ],
    },
    {
      icon: <img src={gudang} alt="Overview Icon" className="h-4 w-4" />,
      tabName: "Gudang",
      subTabs: [
        { tabName: "Stok Gudang", path: "overview-gudang" },
        { tabName: "Perbandingan Pakan", path: "perbandingan-pakan" },
        { tabName: "Pengadaan Barang", path: "pengadaan-barang" },
        { tabName: "Pengadaan Jagung", path: "pengadaan-jagung" },
        { tabName: "Pesanan Toko", path: "pesanan-toko" },
        { tabName: "Daftar Barang", path: "daftar-barang" },
        { tabName: "Daftar Suplier", path: "daftar-suplier" },
        { tabName: "Daftar Vaksin & Obat", path: "daftar-suplier" },
        { tabName: "Riwayat Gudang", path: "riwayat-gudang" },
      ],
    },
    {
      icon: <img src={toko} alt="Overview Icon" className="h-4 w-4" />,
      tabName: "Toko",
      subTabs: [
        { tabName: "Overview Toko", path: "stok-gudang" },
        { tabName: "Stok Toko", path: "pengadaan-barang" },
        { tabName: "Pesan ke Gudang", path: "daftar-barang" },
        { tabName: "Riwayat Stok", path: "pesanan-toko" },
      ],
    },
    {
      icon: <img src={toko} alt="Overview Icon" className="h-4 w-4" />,
      tabName: "Kasir",
      element: <OverviewOwner />,
      subTabs: [
        { tabName: "Daftar Pesanan", path: "daftar-pesanan" },
        { tabName: "Antrian Pesanan", path: "antrian-pesanan" },
        { tabName: "Daftar Harga Telur", path: "daftar-harga-telur" },
      ],
    },
    {
      icon: <GiTempleDoor className="h-4 w-4" />,
      tabName: "Fasilitas",
      subTabs: [
        { tabName: "Daftar Kandang", path: "daftar-kandang" },
        { tabName: "Daftar Toko", path: "daftar-toko" },
        { tabName: "Daftar Gudang", path: "daftar-gudang" },
      ],
    },
    {
      icon: <img src={kelolaPegawai} alt="Overview Icon" className="h-4 w-4" />,
      tabName: "Kelola Pegawai",
      element: <OverviewOwner />,
      subTabs: [
        { tabName: "Ringkasan Kinerja", path: "ringkasan-kinerja" },
        { tabName: "Presensi", path: "presensi" },
        { tabName: "Daftar Pegawai", path: "daftar-pegawai" },
        { tabName: "Tugas Pegawai", path: "tugas-pegawai" },
      ],
    },
    {
      icon: <img src={cashflow} alt="Overview Icon" className="h-4 w-4" />,
      tabName: "Cashflow",
      subTabs: [
        { tabName: "General Cashflow", path: "general-cashflow" },
        { tabName: "Pendapatan", path: "pendapatan" },
        { tabName: "Pengeluaran", path: "pengeluaran" },
        { tabName: "Piutang", path: "piutang" },
        { tabName: "Hutang", path: "Hutang" },
        { tabName: "Gaji Pegawai", path: "gaji-pegawai" },
      ],
    },
  ],
  "Pekerja Kandang": [
    {
      icon: <img src={overview} alt="Overview Icon" className="h-4 w-4" />,
      tabName: "Ringkasan",
      element: <OverviewOwner />,
    },
    {
      icon: <img src={ayam} alt="Overview Icon" className="h-4 w-4" />,
      tabName: "Ayam",
      subTabs: [
        { tabName: "Data Ayam", path: "data-ayam" },
        { tabName: "Vaksin & Obat", path: "vaksin-&-obat" },
        { tabName: "Kandang", path: "kandang" },
      ],
    },
    {
      icon: <GrNotes size={20} />,
      tabName: "Tugas",
      element: <OverviewOwner />,
    },
    {
      icon: <BsPersonSquare size={20} />,
      tabName: "Presensi",
      element: <OverviewOwner />,
    },
  ],
  "Pekerja Telur": [
    {
      icon: <img src={overview} alt="Overview Icon" className="h-4 w-4" />,
      tabName: "Overview",
      element: <OverviewOwner />,
    },
    {
      icon: <img src={produksiTelur} alt="Overview Icon" className="h-4 w-4" />,
      tabName: "Produksi Telur",
      subTabs: [
        { tabName: "Data Produksi Telur", path: "data-ayam" },
        { tabName: "Kandang", path: "overview-ayam" },
      ],
    },
    {
      icon: <GrNotes size={20} />,
      tabName: "Tugas",
      element: <OverviewOwner />,
    },
    {
      icon: <BsPersonSquare size={20} />,
      tabName: "Presensi",
      element: <OverviewOwner />,
    },
  ],
  "Pekerja Toko": [
    {
      icon: <img src={overview} alt="Overview Icon" className="h-4 w-4" />,
      tabName: "Ringkasan",
      element: <OverviewOwner />,
    },
    {
      icon: <img src={toko} alt="Overview Icon" className="h-4 w-4" />,
      tabName: "Kasir",
      element: <OverviewOwner />,
      subTabs: [
        { tabName: "Daftar Pesanan", path: "daftar-pesanan" },
        { tabName: "Antrian Pesanan", path: "antrian-pesanan" },
      ],
    },
    {
      icon: <img src={toko} alt="Overview Icon" className="h-4 w-4" />,
      tabName: "Stok Toko",
      element: <OverviewOwner />,
      subTabs: [
        { tabName: "Overview Stok", path: "overview-stok" },
        { tabName: "Pesan ke Gudang", path: "dalam-pesanan" },
        { tabName: "Riwayat Stok", path: "riwayat-stok" },
      ],
    },
    {
      icon: <GrNotes size={20} />,
      tabName: "Tugas",
      element: <OverviewOwner />,
    },
    {
      icon: <BsPersonSquare size={20} />,
      tabName: "Presensi",
      element: <OverviewOwner />,
    },
  ],
  "Kepala Kandang": [
    {
      icon: <img src={kinerja} alt="Overview Icon" className="h-4 w-4" />,
      tabName: "Kinerja",
      element: <OverviewOwner />,
      subTabs: [
        { tabName: "Ringkasan Kinerja", path: "ringkasan-kinerja" },
        { tabName: "Detail Kinerja Ayam", path: "detail-kinerja-ayam" },
        { tabName: "Pengadaan DOC", path: "detail-kinerja-ayam" },
        { tabName: "Jual Ayam Afkir", path: "detail-kinerja-ayam" },
      ],
    },
    {
      icon: <img src={produksiTelur} alt="Overview Icon" className="h-4 w-4" />,
      tabName: "Produksi Telur",
      subTabs: [
        { tabName: "Ringkasan Produksi Telur", path: "overview-ayam" },
        { tabName: "Data Produksi Telur", path: "data-ayam" },
      ],
    },
    {
      icon: <img src={ayam} alt="ayam Icon" className="h-4 w-4" />,
      tabName: "Ayam",
      element: <OverviewOwner />,
      subTabs: [
        { tabName: "Ringkasan Ayam", path: "overview-ayam" },
        { tabName: "Data Ayam", path: "data-ayam" },
        { tabName: "Vaksin & Obat", path: "detail-vaksin-&-obat" },
      ],
    },
    {
      icon: <FaJarWheat size={20} />,
      tabName: "Pakan",
      element: <OverviewOwner />,
      subTabs: [
        { tabName: "Pembagian Pakan", path: "pembagian-pakan" },
        { tabName: "Formula Pakan", path: "formula-pakan" },
      ],
    },
    {
      icon: <img src={gudang} alt="ayam Icon" className="h-4 w-4" />,
      tabName: "Gudang",
      element: <OverviewOwner />,
      subTabs: [
        { tabName: "Stok Gudang", path: "overview-gudang" },
        { tabName: "Perbandingan Pakan", path: "perbandingan-pakan" },
        { tabName: "Pengadaan Barang", path: "pengadaan-barang" },
        { tabName: "Pengadaan Jagung", path: "pengadaan-jagung" },
        { tabName: "Pesanan Toko", path: "pesanan-toko" },
        { tabName: "Daftar Barang", path: "daftar-barang" },
        { tabName: "Daftar Suplier", path: "daftar-suplier" },
        { tabName: "Daftar Vaksin & Obat", path: "daftar-suplier" },
        { tabName: "Riwayat Gudang", path: "riwayat-gudang" },
      ],
    },
    {
      icon: <img src={toko} alt="Overview Icon" className="h-4 w-4" />,
      tabName: "Kasir",
      element: <OverviewOwner />,
      subTabs: [
        { tabName: "Daftar Pesanan", path: "daftar-pesanan" },
        { tabName: "Antrian Pesanan", path: "antrian-pesanan" },
        { tabName: "Daftar Harga Telur", path: "daftar-harga-telur" },
      ],
    },
    {
      icon: <GiTempleDoor className="h-4 w-4" />,
      tabName: "Fasilitas",
      subTabs: [
        { tabName: "Daftar Kandang", path: "daftar-kandang" },
        { tabName: "Daftar Gudang", path: "daftar-gudang" },
      ],
    },
    {
      icon: <GrNotes size={20} />,
      tabName: "Tugas",
      element: <OverviewOwner />,
    },
    {
      icon: <BsPersonSquare size={20} />,
      tabName: "Presensi",
      element: <OverviewOwner />,
    },
    // add more items
  ],
  "Pekerja Gudang": [
    {
      icon: <img src={produksiTelur} alt="Overview Icon" className="h-4 w-4" />,
      tabName: "Produksi Telur",
    },
    {
      icon: <img src={gudang} alt="ayam Icon" className="h-4 w-4" />,
      tabName: "Gudang",
      element: <OverviewOwner />,
      subTabs: [
        { tabName: "Stok Gudang", path: "overview-gudang" },
        { tabName: "Perbandingan Pakan", path: "perbandingan-pakan" },
        { tabName: "Pengadaan Barang", path: "pengadaan-barang" },
        { tabName: "Pengadaan Jagung", path: "pengadaan-jagung" },
        { tabName: "Pesanan Toko", path: "pesanan-toko" },
        { tabName: "Daftar Barang", path: "daftar-barang" },
        { tabName: "Daftar Suplier", path: "daftar-suplier" },
        { tabName: "Daftar Vaksin & Obat", path: "daftar-suplier" },
        { tabName: "Riwayat Gudang", path: "riwayat-gudang" },
      ],
    },
    {
      icon: <img src={toko} alt="Overview Icon" className="h-4 w-4" />,
      tabName: "Kasir",
      element: <OverviewOwner />,
      subTabs: [
        { tabName: "Daftar Pesanan", path: "daftar-pesanan" },
        { tabName: "Antrian Pesanan", path: "antrian-pesanan" },
      ],
    },
    {
      icon: <GrNotes size={20} />,
      tabName: "Tugas",
      element: <OverviewOwner />,
    },
    {
      icon: <BsPersonSquare size={20} />,
      tabName: "Presensi",
      element: <OverviewOwner />,
    },
    // add more items
  ],
};
