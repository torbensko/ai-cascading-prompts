"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const class_validator_1 = require("class-validator");
// User model represents the application-level User object
class User {
    constructor(dto) {
        this.id = dto.id;
        this.name = dto.name;
        this.dob = dto.dob;
        this.createdAt = new Date(dto.createdAt);
        this.updatedAt = new Date(dto.updatedAt);
        this.validate();
    }
    // Converts the User model back to the UserDTO
    toDTO() {
        return {
            id: this.id,
            name: this.name,
            dob: this.dob,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
        };
    }
    // Validates the User model data
    validate() {
        const errors = (0, class_validator_1.validateSync)(this);
        if (errors.length > 0) {
            throw new Error(`Validation failed: ${errors}`);
        }
    }
}
exports.User = User;
__decorate([
    (0, class_validator_1.IsUUID)()
], User.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)()
], User.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({ strict: true })
], User.prototype, "dob", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({ strict: true })
], User.prototype, "createdAt", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({ strict: true })
], User.prototype, "updatedAt", void 0);
