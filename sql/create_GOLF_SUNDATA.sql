-- ElektraWeb'e gonderilecek ham gun dogumu/batimi verisi icin yeni obje/tablo.
-- Var olan "SunData" tablosuyla (kucuk harfli, farkli sema) cakismamasi icin
-- ayri bir isim kullaniliyor: GOLF_SUNDATA (GOLF_TEETIME_HOURS ile ayni isimlendirme mantigi).
-- src/api/pushSunData.ts / sunDataMapper.ts'in gonderdigi Row alanlariyla birebir eslesir.

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'GOLF_SUNDATA')
CREATE TABLE GOLF_SUNDATA (
  DEPID               INT NOT NULL,
  PLACEID             INT NOT NULL,
  [DATE]              DATE NOT NULL,
  SUNRISE             TIME NOT NULL,
  SUNSET              TIME NOT NULL,
  CIVILTWILIGHTBEGIN  TIME NOT NULL,
  CIVILTWILIGHTEND    TIME NOT NULL,
  CONSTRAINT UQ_GOLF_SUNDATA_Dep_Place_Date
      UNIQUE (DEPID, PLACEID, [DATE])
)
