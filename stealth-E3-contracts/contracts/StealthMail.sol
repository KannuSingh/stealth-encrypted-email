// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

contract StealthMail {
    // =========================================== Events ============================================

    /// @notice Emitted when a payment is sent
    event Announcement(
        address indexed receiver, // stealth address
        bytes32 pkx, // ephemeral public key x coordinate
        bytes32 ciphertext, // encrypted entropy and payload extension
        bytes cid
    );

    // ======================================= Send =================================================

    /**
     * @notice Send and announce ETH payment to a stealth address
     * @param _receiver Stealth address receiving the payment
     * @param _pkx X-coordinate of the ephemeral public key used to encrypt the payload
     * @param _ciphertext Encrypted entropy (used to generated the stealth address) and payload extension
     */
    function sendEmail(
        address payable _receiver,
        bytes32 _pkx, // ephemeral public key x coordinate
        bytes32 _ciphertext,
        bytes calldata _cid
    ) external payable {
        emit Announcement(_receiver, _pkx, _ciphertext, _cid);
    }
}
