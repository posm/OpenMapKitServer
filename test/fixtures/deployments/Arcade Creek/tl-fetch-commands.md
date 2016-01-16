tl copy -z 13 -Z 21 -b '-121.380301 38.643691 -121.349831 38.660783' 'http://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png' mbtiles://./arcade-creek-hot.mbtiles

tl copy -z 13 -Z 19 -b '-121.380301 38.643691 -121.349831 38.660783' 'http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' mbtiles://./arcade-creek-sat.mbtiles

tl copy -z 13 -Z 21 -b '-121.380301 38.643691 -121.349831 38.660783' 'http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' mbtiles://./arcade-creek-sat21.mbtiles