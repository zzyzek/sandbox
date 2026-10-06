import ZZN.Finite2

/-! The box 20 × 14, checked by `native_decide` with the move search `moveB2`. -/

namespace ZZN

theorem box_20_14 : (List.range 20).all (checkBoxC checkInst2 20 14) = true := by native_decide

end ZZN
