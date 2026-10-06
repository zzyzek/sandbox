import ZZN.Finite2

/-! The box 17 × 16, checked by `native_decide` with the move search `moveB2`. -/

namespace ZZN

theorem box_17_16 : (List.range 17).all (checkBoxC checkInst2 17 16) = true := by native_decide

end ZZN
