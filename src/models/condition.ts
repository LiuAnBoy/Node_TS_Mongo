import mongoose from "mongoose";

const ConditionSchema = new mongoose.Schema<ICondition>(
  {
    name: { type: String, required: true },
    is_push: { type: Boolean, default: false },
    house_id: { type: Number, default: 0 },
    user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    floor: { type: String, default: "" },
    searchtype: { type: String, default: "" },
    shape: { type: String, default: "" },
    kind: { type: String, default: "" },
    multiArea: { type: String, default: "" },
    multiNotice: { type: String, default: "" },
    multiRoom: { type: String, default: "" },
    option: { type: String, default: "" },
    other: { type: String, default: "" },
    region: { type: String, required: true },
    section: { type: String, default: "" },
    price: { type: String, default: "" },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date },
  },
  { versionKey: false },
);

const Condition = mongoose.model<ICondition>("Condition", ConditionSchema);

export default Condition;

export interface ICondition extends mongoose.Document, ConditionProps {}

export interface ConditionProps {
  name: string; // 條件名稱
  is_push: boolean; // 是否推播
  house_id: number; // Current id
  user_id: mongoose.Schema.Types.ObjectId; // User id
  floor: string; // 樓層
  searchtype: string; // 位置
  shape: string; // 型態
  kind: string; // 類型
  multiArea: string; // 坪數
  multiNotice: string; // 須知
  multiRoom: string; // 格局
  option: string; // 設備
  other: string; // 特色
  region: string; // 地區
  section: string; // 位置
  price: string; // 租金
  keywords: string; // 關鍵字
  created_at: Date;
  updated_at: Date;
}
