package initializers

import (
	"log"
	"os"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

// Variabel Global 'DB' agar bisa diakses oleh controller manapun nanti
var DB *gorm.DB

func ConnectToDB() {
	var err error
	// Mengambil string koneksi dari file .env
	dsn := os.Getenv("DB_URL")
	
	// Membuka koneksi ke MySQL menggunakan GORM
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})

	// Pengecekan Error: Jika gagal konek, matikan aplikasi (Panic)
	if err != nil {
		log.Fatal("Gagal terhubung ke Database! Cek apakah XAMPP nyala & nama DB benar.")
	}
}