import ZZN.Finite2

/-! The box 22 × 16, checked by `native_decide` with the move search `moveB2`. -/

namespace ZZN

theorem box_22_16 : (List.range 22).all (checkBoxC checkInst2 22 16) = true := by native_decide

end ZZN
