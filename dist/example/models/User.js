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
const toCamelCase_1 = require("@/example/helpers/toCamelCase");
/**
 * User model class definition
 */
class User {
    constructor(userDTO) {
        this.id = userDTO.id;
        this.name = userDTO.name;
        this.dob = userDTO.dob;
        this.createdAt = new Date(userDTO.createdAt);
        this.updatedAt = new Date(userDTO.updatedAt);
        this.slug = (0, toCamelCase_1.toCamelCase)(userDTO.name);
        this.validate();
    }
    /**
     * Converts the User model instance back to a UserDTO
     */
    toDTO() {
        return {
            id: this.id,
            name: this.name,
            dob: this.dob,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
        };
    }
    /**
     * Validates the User model instance using class-validator
     */
    validate() {
        (0, class_validator_1.validateOrReject)(this).catch(errors => {
            throw new Error(`Validation failed! Errors: ${errors}`);
        });
    }
}
exports.User = User;
__decorate([
    (0, class_validator_1.IsString)()
], User.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)()
], User.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.Matches)(/^\d{4}-\d{2}-\d{2}$/)
], User.prototype, "dob", void 0);
__decorate([
    (0, class_validator_1.IsDate)()
], User.prototype, "createdAt", void 0);
__decorate([
    (0, class_validator_1.IsDate)()
], User.prototype, "updatedAt", void 0);
__decorate([
    (0, class_validator_1.IsString)()
], User.prototype, "slug", void 0);
