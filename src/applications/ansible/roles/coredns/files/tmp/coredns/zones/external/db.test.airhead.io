;
; BIND data file for external test.airhead.io
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
@        IN      NS        c.ns.buddyns.com.

; A records
@        3600    IN        A        80.229.15.117

; CNAME records
admin    3600    IN        CNAME    test.airhead.io.
cdn      3600    IN        CNAME    test.airhead.io.
login    3600    IN        CNAME    test.airhead.io.
uk       3600    IN        CNAME    test.airhead.io.
