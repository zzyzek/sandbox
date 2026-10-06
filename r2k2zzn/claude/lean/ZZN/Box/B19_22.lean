import ZZN.Finite2

/-! The box 19 × 22, checked by `native_decide` with the move search `moveB2`. -/

namespace ZZN

theorem box_19_22 : (List.range 19).all (checkBoxC checkInst2 19 22) = true := by native_decide

end ZZN
