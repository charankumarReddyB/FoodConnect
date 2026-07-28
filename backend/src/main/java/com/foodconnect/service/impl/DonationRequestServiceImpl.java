package com.foodconnect.service.impl;

import com.foodconnect.dto.request.DonationRequestCreateDto;
import com.foodconnect.dto.response.DonationRequestResponse;
import com.foodconnect.entity.Donation;
import com.foodconnect.entity.DonationRequest;
import com.foodconnect.entity.User;
import com.foodconnect.enums.DonationStatus;
import com.foodconnect.enums.RequestStatus;
import com.foodconnect.exception.BadRequestException;
import com.foodconnect.exception.DuplicateResourceException;
import com.foodconnect.exception.ResourceNotFoundException;
import com.foodconnect.exception.UnauthorizedException;
import com.foodconnect.mapper.RequestMapper;
import com.foodconnect.repository.DonationRepository;
import com.foodconnect.repository.DonationRequestRepository;
import com.foodconnect.repository.UserRepository;
import com.foodconnect.service.DonationRequestService;
import com.foodconnect.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DonationRequestServiceImpl implements DonationRequestService {

    private final DonationRequestRepository requestRepository;
    private final DonationRepository donationRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final RequestMapper requestMapper;

    @Override
    @Transactional
    public DonationRequestResponse createRequest(Long recipientId, DonationRequestCreateDto dto) {
        Donation donation = donationRepository.findById(dto.getDonationId())
                .orElseThrow(() -> new ResourceNotFoundException("Donation", "id", dto.getDonationId()));

        if (donation.getStatus() != DonationStatus.CREATED && donation.getStatus() != DonationStatus.REQUESTED) {
            throw new BadRequestException("Donation is not available for request. Current status: " + donation.getStatus());
        }

        if (donation.getPickupDeadline().isBefore(LocalDateTime.now())) {
            donation.setStatus(DonationStatus.EXPIRED);
            donationRepository.save(donation);
            throw new BadRequestException("This donation has expired.");
        }

        if (requestRepository.existsByDonationIdAndRecipientId(dto.getDonationId(), recipientId)) {
            throw new DuplicateResourceException("You have already submitted a request for this donation.");
        }

        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", recipientId));

        DonationRequest request = DonationRequest.builder()
                .donation(donation)
                .recipient(recipient)
                .status(RequestStatus.PENDING)
                .build();

        donation.setStatus(DonationStatus.REQUESTED);
        donationRepository.save(donation);

        DonationRequest saved = requestRepository.save(request);

        notificationService.createNotification(
                donation.getDonor().getId(),
                "New donation request received for '" + donation.getFoodName() + "' from " + recipient.getName(),
                "DONATION_REQUEST"
        );

        return requestMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public DonationRequestResponse acceptRequest(Long requestId, Long donorId) {
        DonationRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("DonationRequest", "id", requestId));

        if (!request.getDonation().getDonor().getId().equals(donorId)) {
            throw new UnauthorizedException("Only the donation owner can accept requests.");
        }

        request.setStatus(RequestStatus.ACCEPTED);
        request.setApprovalTime(LocalDateTime.now());

        Donation donation = request.getDonation();
        donation.setStatus(DonationStatus.ACCEPTED);
        donationRepository.save(donation);

        List<DonationRequest> otherRequests = requestRepository.findByDonationIdAndStatus(donation.getId(), RequestStatus.PENDING);
        for (DonationRequest other : otherRequests) {
            if (!other.getId().equals(requestId)) {
                other.setStatus(RequestStatus.REJECTED);
                requestRepository.save(other);
            }
        }

        DonationRequest updated = requestRepository.save(request);

        notificationService.createNotification(
                request.getRecipient().getId(),
                "Your request for donation '" + donation.getFoodName() + "' has been ACCEPTED by the donor!",
                "REQUEST_ACCEPTED"
        );

        return requestMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public DonationRequestResponse rejectRequest(Long requestId, Long donorId) {
        DonationRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("DonationRequest", "id", requestId));

        if (!request.getDonation().getDonor().getId().equals(donorId)) {
            throw new UnauthorizedException("Only the donation owner can reject requests.");
        }

        request.setStatus(RequestStatus.REJECTED);
        DonationRequest updated = requestRepository.save(request);

        notificationService.createNotification(
                request.getRecipient().getId(),
                "Your request for donation '" + request.getDonation().getFoodName() + "' was not accepted.",
                "REQUEST_REJECTED"
        );

        return requestMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public DonationRequestResponse cancelRequest(Long requestId, Long recipientId) {
        DonationRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("DonationRequest", "id", requestId));

        if (!request.getRecipient().getId().equals(recipientId)) {
            throw new UnauthorizedException("Only the recipient can cancel their request.");
        }

        request.setStatus(RequestStatus.CANCELLED);
        DonationRequest updated = requestRepository.save(request);
        return requestMapper.toResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DonationRequestResponse> getRequestsForDonation(Long donationId, Long donorId) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation", "id", donationId));

        if (!donation.getDonor().getId().equals(donorId)) {
            throw new UnauthorizedException("Only the donor can view requests for this donation.");
        }

        return requestRepository.findByDonationId(donationId).stream()
                .map(requestMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<DonationRequestResponse> getMyRequests(Long recipientId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("requestTime").descending());
        Page<DonationRequest> pageResult = requestRepository.findByRecipientId(recipientId, pageable);

        List<DonationRequestResponse> content = pageResult.getContent().stream()
                .map(requestMapper::toResponse)
                .toList();

        return PagedResponse.<DonationRequestResponse>builder()
                .content(content)
                .pageNumber(pageResult.getNumber())
                .pageSize(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .last(pageResult.isLast())
                .build();
    }
}
