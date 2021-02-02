;
; BIND data file for internal dev.airhead.io
;
$TTL 86400
@   IN    SOA    dns01.fdavidson.net. admin.fdavidson.net. (
    1
    43200
    7200
    2419200
    86400
)

; NS records
@        IN      NS        dns01.fdavidson.net.

; A records
@        3600    IN        A        192.168.225.34

; CNAME records
admin    3600    IN        CNAME    dev.airhead.io.
cdn      3600    IN        CNAME    dev.airhead.io.
login    3600    IN        CNAME    dev.airhead.io.
uk       3600    IN        CNAME    dev.airhead.io.
