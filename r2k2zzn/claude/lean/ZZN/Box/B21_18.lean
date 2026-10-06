import ZZN.Finite2

/-! The box 21 × 18, checked by `native_decide` with the move search `moveB2`. -/

namespace ZZN

theorem box_21_18 : (List.range 21).all (checkBoxC checkInst2 21 18) = true := by native_decide

end ZZN
