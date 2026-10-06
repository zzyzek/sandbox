import ZZN.Finite2

/-! The box 12 × 11, checked by `native_decide` with the move search `moveB2`. -/

namespace ZZN

theorem box_12_11 : (List.range 12).all (checkBoxC checkInst2 12 11) = true := by native_decide

end ZZN
