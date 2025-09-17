const roleNotificationContexts = {
  "Pekerja Telur": ["Monitoring Telur"],
  "Pekerja Kandang": ["Monitoring Ayam"],
  "Kepala Kandang": ["Monitoring Ayam", "Monitoring Telur"],
  "Pekerja Toko": ["Penjualan Toko"],
  "Pekerja Gudang": ["Penjualan Gudang", "Barang Gudang"],
  Owner: [
    "Penjualan Gudang",
    "Penjualan Toko",
    "Monitoring Telur",
    "Monitoring Ayam",
    "Barang Gudang",
    "Hutang",
    "Piutang",
    "Pengadaan Ayam",
    "Pengadaan Barang",
    "Pengadaan Barang Jagung",
    "Pinjaman Pegawai",
  ],
  Lainnya: [],
};

export const getNotificationContextsByRole = (roleName) => {
  return roleNotificationContexts[roleName] || [];
};
