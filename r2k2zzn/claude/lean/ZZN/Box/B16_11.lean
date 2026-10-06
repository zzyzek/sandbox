import ZZN.Finite2

/-! The box 16 × 11, checked by `native_decide` with the move search `moveB2`. -/

namespace ZZN

theorem box_16_11 : (List.range 16).all (checkBoxC checkInst2 16 11) = true := by native_decide

end ZZN
