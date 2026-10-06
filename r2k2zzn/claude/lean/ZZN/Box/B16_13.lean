import ZZN.Finite2

/-! The box 16 × 13, checked by `native_decide` with the move search `moveB2`. -/

namespace ZZN

theorem box_16_13 : (List.range 16).all (checkBoxC checkInst2 16 13) = true := by native_decide

end ZZN
