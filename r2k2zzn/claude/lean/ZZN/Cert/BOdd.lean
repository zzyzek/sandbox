import ZZN.WinBCD

namespace ZZN.Win

/-- Certificates for the B entries, odd class. -/
theorem cert_b_odd : ∀ e ∈ BOUNDARY3_ODD, ∀ A, A ≤ 1 → ∀ fsl ∈ [none, some 0, some 11],
    (fsB e 1 = 1 ∨ fsB e 1 = -1) → (fsl ≠ none → fsB e 1 = 1) →
      certify 6 6 (tmB e A) 1 (some (1 - A, fsB e 1, fsl)) = true := by
  native_decide

end ZZN.Win
