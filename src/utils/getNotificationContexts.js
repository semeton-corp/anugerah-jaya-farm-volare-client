export const getNotificationContexts = (role) => {
  switch (role) {
    case "Pekerja Toko":
      return ["Penjualan Toko", "Piutang"];

    case "Pekerja Gudang":
      return [
        "Penjualan Gudang",
        "Pengadaan Barang",
        "Pengadaan Jagung",
        "Barang Gudang",
        "Hutang",
        "Piutang",
      ];

    case "Pekerja Telur":
      return ["Monitoring Telur", "Hutang", "Piutang"];

    case "Pekerja Kandang":
      return ["Monitoring Ayam", "Hutang", "Piutang"];

    case "Kepala Kandang":
      return [
        "Penjualan Gudang",
        "Monitoring Telur",
        "Monitoring Ayam",
        "Barang Gudang",
        "Hutang",
        "Piutang",
        "Pengadaan Ayam",
        "Pengadaan Barang",
        "Pengadaan Barang Jagung",
      ];

    case "Owner":
      return [
        "Penjualan Gudang",
        "Penjualan Toko",
        "Monitoring Telur",
        "Penjualan Ayam",
        "Monitoring Ayam",
        "Barang Gudang",
        "Hutang",
        "Piutang",
        "Pengadaan Ayam",
        "Pengadaan Barang",
        "Pengadaan Barang Jagung",
        "Pinjaman Pegawai",
      ];

    default:
      return [];
  }
};
