;; Compliance Monitoring Contract
;; Ensures adherence to program requirements

(define-data-var admin principal tx-sender)

;; Map of property-resident pairs to occupancy details
(define-map occupancies
  { property-id: uint, resident: principal }
  {
    move-in-date: uint,
    lease-expiry: uint,
    rent-amount: uint,
    last-compliance-check: uint,
    compliance-status: (string-ascii 20), ;; "compliant", "warning", "violation"
    violations: uint
  }
)

;; Map of compliance inspectors
(define-map inspectors
  principal
  { active: bool }
)

;; Map to track property details (simplified from property-registration)
(define-map properties
  uint
  {
    owner: principal,
    monthly-rent: uint
  }
)

;; Initialize the contract
(define-public (initialize)
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u1))
    (ok true)
  )
)

;; Add an inspector
(define-public (add-inspector (inspector principal))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u2))
    (map-set inspectors inspector { active: true })
    (ok true)
  )
)

;; Remove an inspector
(define-public (remove-inspector (inspector principal))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u2))
    (map-set inspectors inspector { active: false })
    (ok true)
  )
)

;; Set property details (admin function to sync with property-registration)
(define-public (set-property-details (property-id uint) (owner principal) (monthly-rent uint))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u2))
    (map-set properties property-id { owner: owner, monthly-rent: monthly-rent })
    (ok true)
  )
)

;; Register a new occupancy
(define-public (register-occupancy
  (property-id uint)
  (resident principal)
  (lease-expiry uint)
)
  (let (
    (property (default-to { owner: tx-sender, monthly-rent: u0 } (map-get? properties property-id)))
  )
    ;; Only property owner can register occupancy
    (asserts! (is-eq tx-sender (get owner property)) (err u3))

    ;; Create the occupancy record
    (map-set occupancies
      { property-id: property-id, resident: resident }
      {
        move-in-date: block-height,
        lease-expiry: lease-expiry,
        rent-amount: (get monthly-rent property),
        last-compliance-check: block-height,
        compliance-status: "compliant",
        violations: u0
      }
    )

    (ok true)
  )
)

;; Perform compliance check
(define-public (perform-compliance-check
  (property-id uint)
  (resident principal)
  (compliance-status (string-ascii 20))
  (add-violation bool)
)
  (let (
    (occupancy (unwrap! (map-get? occupancies { property-id: property-id, resident: resident }) (err u4)))
    (is-inspector (default-to { active: false } (map-get? inspectors tx-sender)))
    (current-violations (get violations occupancy))
  )
    ;; Only active inspectors can perform compliance checks
    (asserts! (get active is-inspector) (err u5))

    ;; Update the occupancy record
    (map-set occupancies
      { property-id: property-id, resident: resident }
      (merge occupancy {
        last-compliance-check: block-height,
        compliance-status: compliance-status,
        violations: (if add-violation (+ current-violations u1) current-violations)
      })
    )

    (ok true)
  )
)

;; End occupancy
(define-public (end-occupancy (property-id uint) (resident principal))
  (let (
    (occupancy (unwrap! (map-get? occupancies { property-id: property-id, resident: resident }) (err u4)))
    (property (default-to { owner: tx-sender, monthly-rent: u0 } (map-get? properties property-id)))
  )
    ;; Only property owner can end occupancy
    (asserts! (is-eq tx-sender (get owner property)) (err u3))

    ;; Delete the occupancy record
    (map-delete occupancies { property-id: property-id, resident: resident })

    (ok true)
  )
)

;; Get occupancy details
(define-read-only (get-occupancy (property-id uint) (resident principal))
  (map-get? occupancies { property-id: property-id, resident: resident })
)

;; Check if occupancy is compliant
(define-read-only (is-compliant (property-id uint) (resident principal))
  (match (map-get? occupancies { property-id: property-id, resident: resident })
    occupancy (is-eq (get compliance-status occupancy) "compliant")
    false)
)

;; Check if lease is expired
(define-read-only (is-lease-expired (property-id uint) (resident principal))
  (match (map-get? occupancies { property-id: property-id, resident: resident })
    occupancy (>= block-height (get lease-expiry occupancy))
    false)
)

;; Transfer admin rights
(define-public (transfer-admin (new-admin principal))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u6))
    (var-set admin new-admin)
    (ok true)
  )
)

