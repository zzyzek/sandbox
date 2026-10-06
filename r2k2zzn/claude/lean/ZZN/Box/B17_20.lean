import ZZN.Finite2

/-! The box 17 × 20, checked by `native_decide` with the move search `moveB2`. -/

namespace ZZN

theorem box_17_20 : (List.range 17).all (checkBoxC checkInst2 17 20) = true := by native_decide

end ZZN
