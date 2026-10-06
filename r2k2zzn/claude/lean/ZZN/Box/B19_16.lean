import ZZN.Finite2

/-! The box 19 × 16, checked by `native_decide` with the move search `moveB2`. -/

namespace ZZN

theorem box_19_16 : (List.range 19).all (checkBoxC checkInst2 19 16) = true := by native_decide

end ZZN
