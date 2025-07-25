;; public-crisis-ledger
;; A simple, immutable ledger for authorized entities to register hashes of public announcements.
;; This helps combat misinformation during critical events by providing a verifiable source of truth.

;; --- Constants and Errors ---
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_UNAUTHORIZED (err u401))

;; --- Data Storage ---
(define-data-var last-message-id uint u0)
(define-map messages
  uint ;; message-id
  {
    hash: (buff 32),      ;; SHA256 hash of the message content
    announcer: principal, ;; The principal that announced the message
    block-height: uint    ;; The block height at which it was announced
  }
)

;; --- Public Functions ---

;; @desc Registers the hash of a message. Only the contract owner can call this.
;; @param message-hash: The SHA256 hash of the message to be registered.
;; @returns (ok uint) with the new message ID, or (err uint) on failure.
(define-public (register-message (message-hash (buff 32)))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (let ((new-id (+ (var-get last-message-id) u1)))
      (map-set messages new-id
        {
          hash: message-hash,
          announcer: tx-sender,
          block-height: block-height
        }
      )
      (var-set last-message-id new-id)
      (ok new-id)
    )
  )
)

;; --- Read-Only Functions ---

;; @desc Retrieves the details of a registered message by its ID.
;; @param id: The ID of the message to retrieve.
;; @returns (some {hash: (buff 32), announcer: principal, block-height: uint}) or none if not found.
(define-read-only (get-message (id uint))
  (map-get? messages id)
)