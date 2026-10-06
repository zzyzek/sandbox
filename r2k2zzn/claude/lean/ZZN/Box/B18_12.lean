import ZZN.Finite2

/-! The box 18 × 12, checked by `native_decide` with the move search `moveB2`. -/

namespace ZZN

theorem box_18_12 : (List.range 18).all (checkBoxC checkInst2 18 12) = true := by native_decide

end ZZN
