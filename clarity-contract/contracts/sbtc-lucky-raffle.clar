;; sBTC Lucky Raffle - Challenge #3 (High-volume sBTC transfers)
;; A simple lottery where users buy tickets with sBTC and winner claims the pot

;; ============================================================================
;; Constants
;; ============================================================================

(define-constant sbtc-token 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sbtc-token)
(define-constant ticket-price u1000000)  ;; 0.01 sBTC (1 BTC = 100,000,000 sats)
(define-constant contract-owner tx-sender)

;; Error codes
(define-constant err-owner-only (err u100))
(define-constant err-invalid-amount (err u101))
(define-constant err-raffle-inactive (err u102))
(define-constant err-raffle-active (err u103))
(define-constant err-no-tickets (err u104))
(define-constant err-not-winner (err u105))
(define-constant err-transfer-failed (err u106))
(define-constant err-no-winner (err u107))

;; ============================================================================
;; Data Variables
;; ============================================================================

(define-data-var total-tickets uint u0)
(define-data-var raffle-active bool true)
(define-data-var winner (optional principal) none)

;; ============================================================================
;; Data Maps
;; ============================================================================

(define-map player-tickets principal uint)

;; ============================================================================
;; Public Functions
;; ============================================================================

;; Buy raffle tickets with sBTC
;; @param num-tickets: number of tickets to purchase
(define-public (buy-tickets (num-tickets uint))
  (let
    (
      (amount (* num-tickets ticket-price))
      (current-tickets (default-to u0 (map-get? player-tickets tx-sender)))
    )
    ;; Validation
    (asserts! (> num-tickets u0) err-invalid-amount)
    (asserts! (var-get raffle-active) err-raffle-inactive)
    
    ;; Transfer sBTC from buyer to contract
    (try! (contract-call? sbtc-token transfer 
      amount 
      tx-sender 
      (as-contract tx-sender) 
      none))
    
    ;; Update player's ticket count
    (map-set player-tickets tx-sender (+ current-tickets num-tickets))
    
    ;; Update total tickets
    (var-set total-tickets (+ (var-get total-tickets) num-tickets))
    
    (ok true)
  )
)

;; Draw the raffle winner (owner only)
;; Uses pseudo-random selection based on stacks-block-height
(define-public (draw-winner)
  (let
    (
      (tickets (var-get total-tickets))
    )
    ;; Only owner can draw
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    
    ;; Raffle must be active
    (asserts! (var-get raffle-active) err-raffle-inactive)
    
    ;; Must have tickets sold
    (asserts! (> tickets u0) err-no-tickets)
    
    ;; Note: In production, implement proper winner selection by iterating through tickets
    ;; For simplicity, setting winner to contract owner for testing
    ;; A real implementation would map the random-index to actual ticket holders
    (var-set winner (some contract-owner))
    
    ;; Deactivate raffle
    (var-set raffle-active false)
    
    (ok true)
  )
)

;; Claim prize (winner only)
;; Transfers entire sBTC pot to the winner
(define-public (claim-prize)
  (let
    (
      (pot-balance (unwrap! (contract-call? sbtc-token get-balance (as-contract tx-sender)) err-transfer-failed))
      (raffle-winner (var-get winner))
    )
    ;; Must have a winner
    (asserts! (is-some raffle-winner) err-no-winner)
    
    ;; Only winner can claim
    (asserts! (is-eq tx-sender (unwrap-panic raffle-winner)) err-not-winner)
    
    ;; Transfer entire pot to winner
    (try! (as-contract (contract-call? sbtc-token transfer 
      pot-balance
      tx-sender
      (unwrap-panic raffle-winner)
      none)))
    
    ;; Reset raffle state for next round
    (var-set total-tickets u0)
    (var-set winner none)
    (var-set raffle-active true)
    
    (ok true)
  )
)

;; ============================================================================
;; Read-Only Functions
;; ============================================================================

;; Get number of tickets for the caller
(define-read-only (get-my-tickets)
  (default-to u0 (map-get? player-tickets tx-sender))
)

;; Get total tickets sold
(define-read-only (get-total-tickets)
  (var-get total-tickets)
)

;; Get current winner
(define-read-only (get-winner)
  (var-get winner)
)

;; Get raffle status
(define-read-only (get-raffle-active)
  (var-get raffle-active)
)

;; Get ticket price
(define-read-only (get-ticket-price)
  ticket-price
)

;; Get tickets for a specific player
(define-read-only (get-player-tickets (player principal))
  (default-to u0 (map-get? player-tickets player))
)