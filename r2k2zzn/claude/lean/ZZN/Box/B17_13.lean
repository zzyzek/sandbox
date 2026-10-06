import ZZN.Finite2

/-! The box 17 × 13, checked by `native_decide` with the move search `moveB2`. -/

namespace ZZN

theorem box_17_13 : (List.range 17).all (checkBoxC checkInst2 17 13) = true := by native_decide

end ZZN
