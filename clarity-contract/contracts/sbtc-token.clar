;; Mock sBTC Token for Testing
;; Simple SIP-010 compliant fungible token

(define-fungible-token sbtc)

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-token-owner (err u101))
(define-constant err-invalid-amount (err u102))
(define-constant err-insufficient-balance (err u103))
(define-constant err-invalid-mint-amount (err u104))
(define-constant err-invalid-recipient (err u105))

;; Transfer function
(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender sender) err-not-token-owner)
    (asserts! (> amount u0) err-invalid-amount)
    (asserts! (>= (ft-get-balance sbtc sender) amount) err-insufficient-balance)
    (asserts! (not (is-eq recipient (as-contract tx-sender))) err-invalid-recipient)
    (try! (ft-transfer? sbtc amount sender recipient))
    (match memo to-print (print to-print) 0x)
    (ok true)
  )
)

;; Get balance
(define-read-only (get-balance (who principal))
  (ok (ft-get-balance sbtc who))
)

;; Mint function for testing
(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (> amount u0) err-invalid-mint-amount)
    (asserts! (not (is-eq recipient (as-contract tx-sender))) err-invalid-recipient)
    (ft-mint? sbtc amount recipient)
  )
)

;; Get token name
(define-read-only (get-name)
  (ok "sBTC Token")
)

;; Get token symbol
(define-read-only (get-symbol)
  (ok "sBTC")
)

;; Get decimals
(define-read-only (get-decimals)
  (ok u8)
)

;; Get token URI
(define-read-only (get-token-uri)
  (ok (some u"https://sbtc.tech"))
)
